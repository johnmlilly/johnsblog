import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/r/content-modelling-collections/
  schema: {
    collections: [
      {
        name: "blog",
        label: "Blog",
        path: "src/blog",
        format: "md",
        ui: {
          filename: {
            slugify: (values) =>
              values?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "new-post",
          },
        },
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "description", label: "Description" },
          { type: "datetime", name: "date", label: "Date" },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
            options: [
              "post",
              "featured",
              "Web Development",
              "JavaScript",
              "CSS",
              "C#",
            ],
          },
          { type: "image", name: "image", label: "Featured Image" },
          { type: "string", name: "imageAlt", label: "Image Caption" },
          { type: "rich-text", name: "body", label: "Body" },
        ],
      },
      {
        name: "projects",
        label: "Projects",
        path: "src/projects",
        format: "md",
        ui: {
          filename: {
            slugify: (values) =>
              values?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "new-project",
          },
        },
        fields: [
          { type: "string", name: "title", label: "Project Name", isTitle: true, required: true },
          { type: "datetime", name: "date", label: "Project Date" },
          { type: "string", name: "description", label: "Project Description", ui: { component: "textarea" } },
          { type: "image", name: "image", label: "Project Image" },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
            options: ["WordPress", "UX/UI", "Mobile Responsiveness"],
          },
          { type: "string", name: "link", label: "Project Link" },
        ],
      },
      {
        name: "skills",
        label: "Skills",
        path: "src/skills",
        format: "md",
        ui: {
          filename: {
            slugify: (values) =>
              values?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "new-skill",
          },
        },
        fields: [
          { type: "string", name: "title", label: "Skill Name", isTitle: true, required: true },
          { type: "number", name: "order", label: "Order" },
          { type: "string", name: "skills", label: "Skills", list: true },
        ],
      },
    ],
  },
});
