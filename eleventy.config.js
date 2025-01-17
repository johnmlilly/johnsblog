import { DateTime } from "luxon";

export default function(eleventyConfig) {

eleventyConfig.addPassthroughCopy('./src/styles/style.css');
eleventyConfig.addPassthroughCopy('./src/assets') ;
eleventyConfig.addPassthroughCopy('./src/scripts/main.js');
eleventyConfig.addPassthroughCopy('./src/admin');

// Get current year for footer
eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

// Format blog date into readable format
eleventyConfig.addFilter("postDate", (dateObj) => {
  return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
});

    return {
      dir: {
        input: "src",    // Source directory for your content
        output: "public" // Directory where the built files will be output
      }
    };
}
  