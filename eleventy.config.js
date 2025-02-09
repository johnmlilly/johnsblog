import { DateTime } from "luxon";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import emojiReadTime from "@11tyrocks/eleventy-plugin-emoji-readtime";
import metagen from "eleventy-plugin-metagen";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default function(eleventyConfig) {

eleventyConfig.addPassthroughCopy('./src/styles');
eleventyConfig.addPassthroughCopy('./src/assets') ;
eleventyConfig.addPassthroughCopy('./src/scripts');
eleventyConfig.addPassthroughCopy('./src/admin');
eleventyConfig.addPlugin(syntaxHighlight);
eleventyConfig.addPlugin(emojiReadTime, {
  emoji: "🕒",
  label: "minute read"
});
eleventyConfig.addPlugin(metagen);
eleventyConfig.addPlugin(eleventyImageTransformPlugin);

// Get current year for footer
eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

// Format blog date into readable format
eleventyConfig.addFilter("postDate", (dateObj) => {
  return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
});

// Star Wars Quote Shortcode
eleventyConfig.addShortcode("cloneWarsQuote", () => {
  const quotes = [
    { text: "Easy is the path to wisdom for those not blinded by ego.", Season: "1", Episode: "3" },
    { text: "The best confidence builder is experience.", Season: "1", Episode: "5" },
    { text: "If you ignore the past, you jeopardize your future.", Season: "2", Episode: "11" },
    { text: "In war, truth is the first casualty.", Season: "2", Episode: "13" },
    { text: "The most dangerous beast is the beast within.", Season: "2", Episode: "18" },
    { text: "Friendship shows us who we really are.", Season: "4", Episode: "14" },
    { text: "The young are often underestimated.", Season: "5", Episode: "7" },
    { text: "Never give up hope, no matter how dark things seem.", Season: "5", Episode: "20" },
    { text: "The truth about yourself is the hardest to accept.", Season: "6", Episode: "1" },
    { text: "The popular belief isn't always the correct one.", Season: "6", Episode: "4" },
    { text: "What is lost is often found.", Season: "6", Episode: "10" },
    { text: "Facing all that you fear will free you from yourself", Season: "6", Episode: "13" },

  ];
  // Randomly select a quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  return `
    <div class="console">
      <div class="console-screen">
          <img src="/assets/starwars/noun-storm-trooper-49992.svg" alt="Storm Trooper Icon" class="star-wars-quote__icon">
        <div class="star-wars-quote">
          <h2>Wisdom from the Outer Rim</h2>
            <blockquote>
              <p>"${randomQuote.text}"</p>
              <span>— The Clone Wars, Season ${randomQuote.Season}, Episode ${randomQuote.Episode}</span>
            </blockquote>
        </div>
      </div>
    </div>`;
});

// Output folders
    return {
      dir: {
        input: "src",    // Source directory for your content
        output: "public" // Directory where the built files will be output
      }
    };
}
  