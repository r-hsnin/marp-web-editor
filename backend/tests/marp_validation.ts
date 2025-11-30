import { marpConverter } from '../src/lib/marp';

async function validateMarp() {
  console.log('Starting Marp validation...');
  try {
    const markdown = '# Hello Marp\n\n--- \n\n## Slide 2';
    const buffer = await marpConverter.convert({
      markdown,
      format: 'pdf',
    });

    if (buffer && buffer.length > 0) {
      console.log('✅ Marp PDF conversion successful. Buffer size:', buffer.length);
    } else {
      console.error('❌ Marp PDF conversion returned empty buffer.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Marp validation failed:', error);
    process.exit(1);
  }
}

validateMarp();
