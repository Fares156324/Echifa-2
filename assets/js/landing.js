document.addEventListener('DOMContentLoaded', function() {
    const spaceId = 'cg1mybt2b9x3';
    const accessToken = '0eR45Xgv6lUaC7DhQYr9exeCtOlwzkXh1xiKl0EPaKo';
    const contentType = 'blogPost';

    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=${contentType}&include=1&limit=2`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('blog-list');
        const items = data.items;
        const assets = data.includes?.Asset || [];

        items.forEach(item => {
          const fields = item.fields;

          const blogImageId = fields.thumbnail?.sys?.id;

          const blogImage = assets.find(asset => asset.sys.id === blogImageId);

          const blogImgUrl = blogImage ? 'https:' + blogImage.fields.file.url : 'assets/img/default.webp';

          const col = document.createElement('div');
          col.className = 'col-xl-4 col-md-6';
          col.setAttribute('data-aos', 'fade-up');
          col.setAttribute('data-aos-delay', '100');

          col.innerHTML = `
            <article>
              <div class="post-img">
                <img src="${blogImgUrl}" alt="" class="img-fluid">
              </div>
              <p class="post-category">${fields.category || 'Uncategorized'}</p>
              <h2 class="title">
                <a href="blog-details.html?id=${item.sys.id}">
                  ${fields.title || 'No Title'}
                </a>
              </h2>
              <p class="post-description">
                  ${fields.description || 'No description available.'}
                </p>
              </div>
            </article>  
          `;

          container.appendChild(col);
        });

        // Add the "Read More" card after the posts are loaded
        const readMoreCard = document.createElement('div');
        readMoreCard.className = 'col-xl-4 col-md-6';
        readMoreCard.setAttribute('data-aos', 'fade-up');
        readMoreCard.setAttribute('data-aos-delay', '100');

        readMoreCard.innerHTML = `
          <article class="read-more-card">
            <div class="post-img">
              
            </div>
            <p class="post-category">Lire Plus</p>
                        <p>Explorez plus de publications et restez à jour !</p>

            <div class="about">
              <a href="blogs" class="read-more mt-2" style="border-radius:10px;"><span>Voir Plus de Publications</span><i
              class="bi bi-arrow-right"></i></a>
            </div>

          </article>
        `;

        container.appendChild(readMoreCard);

      })
      .catch(error => console.error('Error loading blog posts:', error));
  });