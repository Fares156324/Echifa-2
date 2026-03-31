
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  

  if (!slug) {
    document.querySelector("#blog-details .content").innerHTML = "<p>Blog not found.</p>";
    return;
  }

  const apiUrl = `https://cdn.contentful.com/spaces/cg1mybt2b9x3/environments/master/entries?access_token=0eR45Xgv6lUaC7DhQYr9exeCtOlwzkXh1xiKl0EPaKo&content_type=blogPost&fields.slug=${slug}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(async data => {
      if (!data.items || data.items.length === 0) {
        document.querySelector("#blog-details .content").innerHTML = "<p>Blog not found.</p>";
        return;
      }

      const blog = data.items[0];
      const fields = blog.fields;
      const blogImageId = fields.thumbnail?.sys?.id;

      document.title = fields.title + " | VETS Clinics" || "Blog | VETS Clinics";

      if (blogImageId) {
        fetch(`https://cdn.contentful.com/spaces/cg1mybt2b9x3/environments/master/assets/${blogImageId}?access_token=0eR45Xgv6lUaC7DhQYr9exeCtOlwzkXh1xiKl0EPaKo`)
          .then(response => response.json())
          .then(imageData => {
            const blogImgUrl = 'https:' + imageData.fields.file.url;
            document.querySelector("#blog-details .post-img img").src = blogImgUrl;
          })
          .catch(() => {
            document.querySelector("#blog-details .post-img img").src = "assets/img/default.webp";
          });
      } else {
        document.querySelector("#blog-details .post-img img").src = "assets/img/default.webp";
      }

      document.querySelector("#blog-details .title").textContent = fields.title || "No Title";
      document.querySelector("#blog-details .meta-top time").textContent = new Date(fields.creationDate).toLocaleDateString();

      const richTextDocument = fields.content;
      const htmlContent = await formatRichText(richTextDocument);
      if (htmlContent) {
        document.querySelector("#blog-details .content").innerHTML = htmlContent;
      }

      document.querySelector("#blog-details .meta-bottom .tags li a").textContent = fields.author || "Unknown Author";

      const tags = fields.tags || [];
      const tagsContainer = document.querySelector("#tags-widget ul");
      if (tagsContainer && tags.length > 0) {
        tagsContainer.innerHTML = tags.map(tag => `<li><a href="#">${tag}</a></li>`).join('');
      } else if (tagsContainer) {
        tagsContainer.innerHTML = "<li><em>No tags available</em></li>";
      }



    })
    .catch(error => console.error("Error loading blog:", error));
});

// Helper function to render Contentful rich text
async function formatRichText(node) {
  if (!node) return '';

  switch (node.nodeType) {
    case 'text':
      const text = node.value || '';
      const isBold = node.marks?.some((mark) => mark.type === 'bold');
      return isBold ? `<strong>${text}</strong>` : text;

    case 'hyperlink':
      const url = node.data.uri;
      const linkText = await Promise.all(node.content?.map(formatRichText));
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText.join('')}</a>`;

    case 'embedded-asset-block':
      const assetId = node.data.target.sys.id;
      try {
        const asset = await fetchAssetFromContentful(assetId);
        const fileUrl = asset.fields.file.url;
        const fileTitle = asset.fields.title || "Untitled";
        const width = asset.fields.file.details.image?.width || 750;
        const height = asset.fields.file.details.image?.height || 500;
        return `<div class="embedded-asset">
                  <img src="${fileUrl}" alt="${fileTitle}" width="${width}" height="${height}" />
                </div>`;
      } catch (error) {
        return `<div class="embedded-asset">Error loading asset: ${error.message}</div>`;
      }

    case 'paragraph':
      const paragraphContent = await Promise.all(node.content?.map(formatRichText));
      return `<p>${paragraphContent.join('')}</p>`;

    case 'heading-1':
      const heading1Content = await Promise.all(node.content?.map(formatRichText));
      return `<h1>${heading1Content.join('')}</h1>`;

    case 'heading-2':
      const heading2Content = await Promise.all(node.content?.map(formatRichText));
      return `<h2>${heading2Content.join('')}</h2>`;

    case 'heading-3':
      const heading3Content = await Promise.all(node.content?.map(formatRichText));
      return `<h3>${heading3Content.join('')}</h3>`;

    case 'unordered-list':
      const ulContent = await Promise.all(node.content?.map(formatRichText));
      return `<ul>${ulContent.join('')}</ul>`;

    case 'ordered-list':
      const olContent = await Promise.all(node.content?.map(formatRichText));
      return `<ol>${olContent.join('')}</ol>`;

    case 'list-item':
      const listItemContent = await Promise.all(node.content?.map(formatRichText));
      return `<li>${listItemContent.join('')}</li>`;

    case 'table':
      const tableContent = await Promise.all(node.content?.map(formatRichText));
      return `<table>${tableContent.join('')}</table>`;

    case 'table-row':
      const rowContent = await Promise.all(node.content?.map(formatRichText));
      return `<tr>${rowContent.join('')}</tr>`;

    case 'table-cell':
      const cellContent = await Promise.all(node.content?.map(formatRichText));
      return `<td>${cellContent.join('')}</td>`;

    default:
      const defaultContent = await Promise.all(node.content?.map(formatRichText));
      return defaultContent.join('');
  }
}

async function fetchAssetFromContentful(assetId) {
  const spaceId = 'cg1mybt2b9x3';
  const accessToken = '0eR45Xgv6lUaC7DhQYr9exeCtOlwzkXh1xiKl0EPaKo';
  const url = `https://cdn.contentful.com/spaces/${spaceId}/assets/${assetId}?access_token=${accessToken}`;

  const response = await fetch(url);
  const asset = await response.json();

  return asset;
}