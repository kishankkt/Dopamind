import fs from 'fs';
import https from 'https';

const TAG_NAME = process.env.TAG_NAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'kishankkt/Dopamind'; // Make sure this matches your repository

if (!TAG_NAME || !GITHUB_TOKEN) {
  console.error('Missing TAG_NAME or GITHUB_TOKEN environment variables');
  process.exit(1);
}

const getReleaseData = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${REPO}/releases/tags/${TAG_NAME}`,
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to fetch release: ${res.statusCode} ${data}`));
        }
      });
    }).on('error', reject);
  });
};

const getAssetContent = (url) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/octet-stream'
      }
    };

    https.get(url, options, (res) => {
      if (res.statusCode === 302) {
        // Handle redirect
        https.get(res.headers.location, (redirectRes) => {
          let data = '';
          redirectRes.on('data', chunk => data += chunk);
          redirectRes.on('end', () => resolve(data));
        }).on('error', reject);
      } else if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      } else {
        reject(new Error(`Failed to fetch asset content: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

async function main() {
  try {
    const releaseData = await getReleaseData();
    const assets = releaseData.assets;

    let releaseJson = {
      version: TAG_NAME,
      notes: "Automatic update from GitHub Actions",
      pub_date: new Date().toISOString(),
      platforms: {}
    };

    // Try to load existing release.json to preserve platforms if any are missing
    try {
      if (fs.existsSync('release.json')) {
        const existingData = JSON.parse(fs.readFileSync('release.json', 'utf8'));
        if (existingData.platforms) {
          releaseJson.platforms = existingData.platforms;
        }
      }
    } catch (e) {
      console.log('No existing release.json found or failed to parse. Creating new.');
    }

    // Windows (.nsis.zip or .msi.zip)
    const winZipAsset = assets.find(a => a.name.endsWith('.msi.zip') || a.name.endsWith('.nsis.zip'));
    const winSigAsset = assets.find(a => (a.name.endsWith('.msi.zip.sig') || a.name.endsWith('.nsis.zip.sig')));
    
    if (winZipAsset && winSigAsset) {
      const sigContent = await getAssetContent(winSigAsset.url);
      releaseJson.platforms['windows-x86_64'] = {
        signature: sigContent.trim(),
        url: winZipAsset.browser_download_url
      };
    }

    // macOS (.app.tar.gz)
    const macZipAsset = assets.find(a => a.name.endsWith('.app.tar.gz') || a.name.endsWith('.dmg'));
    const macSigAsset = assets.find(a => a.name.endsWith('.app.tar.gz.sig') || a.name.endsWith('.dmg.sig'));

    if (macZipAsset && macSigAsset) {
      const sigContent = await getAssetContent(macSigAsset.url);
      releaseJson.platforms['darwin-x86_64'] = {
        signature: sigContent.trim(),
        url: macZipAsset.browser_download_url
      };
      releaseJson.platforms['darwin-aarch64'] = {
        signature: sigContent.trim(),
        url: macZipAsset.browser_download_url
      };
    }

    // Linux (.AppImage.tar.gz)
    const linuxZipAsset = assets.find(a => a.name.endsWith('.AppImage.tar.gz'));
    const linuxSigAsset = assets.find(a => a.name.endsWith('.AppImage.tar.gz.sig'));

    if (linuxZipAsset && linuxSigAsset) {
      const sigContent = await getAssetContent(linuxSigAsset.url);
      releaseJson.platforms['linux-x86_64'] = {
        signature: sigContent.trim(),
        url: linuxZipAsset.browser_download_url
      };
    }

    fs.writeFileSync('release.json', JSON.stringify(releaseJson, null, 2));
    console.log('Successfully updated release.json');
  } catch (err) {
    console.error('Error updating release.json:', err);
    process.exit(1);
  }
}

main();
