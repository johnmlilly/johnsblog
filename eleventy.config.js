export default function(eleventyConfig) {

eleventyConfig.addPassthroughCopy('./src/styles/style.css');
eleventyConfig.addPassthroughCopy('./src/assets') ;
eleventyConfig.addPassthroughCopy('./src/scripts/main.js');

    return {
      dir: {
        input: "src",    // Source directory for your content
        output: "public" // Directory where the built files will be output
      }
    };
  }
  