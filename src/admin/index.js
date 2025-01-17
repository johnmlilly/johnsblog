import CMS from "decap-cms-app";
import "/admin/preview-style.css"; // Adjust the path if needed

// Register the custom preview style
CMS.registerPreviewStyle("/admin/preview-style.css");
console.log("CMS preview script loaded!");