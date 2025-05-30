import { cleanAllUploadDirectories } from './server/cleanup';

async function main() {
  try {
    console.log('Starting manual cleanup of all upload directories');
    const count = await cleanAllUploadDirectories();
    console.log(`Successfully cleaned up ${count} temporary files`);
    console.log('Deployment size should now be reduced');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

main();