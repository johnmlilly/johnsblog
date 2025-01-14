export default function(eleventyConfig) {

eleventyConfig.addPassthroughCopy('./src/style.css');
eleventyConfig.addPassthroughCopy('./src/assets') ;

    return {
      dir: {
        input: "src",    // Source directory for your content
        output: "public" // Directory where the built files will be output
      }
    };
  }
  