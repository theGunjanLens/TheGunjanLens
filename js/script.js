function toggleMenu(){
const menu = document.getElementById("navMenu");
menu.classList.toggle("active");
}

const lazyPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";
const galleryImages = document.querySelectorAll('.gallery img');
const isWallpaperPage = window.location.pathname.toLowerCase().includes('wallpaper.html');

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
<div class="lightbox-content">
<button class="lightbox-close" aria-label="Close image">×</button>
<img src="" alt="Expanded gallery view">
<div class="lightbox-caption"></div>
</div>
`;
document.body.appendChild(lightbox);

const lightboxImg = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');
const lightboxClose = lightbox.querySelector('.lightbox-close');

const formatUserTime = () => new Intl.DateTimeFormat('en-IN', {
hour: 'numeric',
minute: '2-digit',
}).format(new Date());

const openLightbox = (image) => {
const finalSrc = image.dataset.src || image.src;
if (!finalSrc) return;
const tempImage = new Image();
tempImage.onload = () => {
const isPortrait = tempImage.naturalHeight > tempImage.naturalWidth;
lightbox.classList.toggle('phone-mode', isWallpaperPage && isPortrait);
lightboxImg.src = finalSrc;
const timeText = formatUserTime();
lightboxCaption.innerHTML = isWallpaperPage && isPortrait
? `<span class="lockscreen-time">${timeText}</span><span class="lockscreen-date">${new Intl.DateTimeFormat('en-IN', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date())}</span>`
: (image.alt || 'Gallery image');
lightbox.classList.add('active');
document.body.classList.add('lightbox-open');
};
tempImage.src = finalSrc;
};

const closeLightbox = () => {
lightbox.classList.remove('active');
document.body.classList.remove('lightbox-open');
};

const loadLazyImage = (image) => {
if (!image || !image.dataset.src) return;
image.src = image.dataset.src;
image.classList.add('is-loaded');
image.removeAttribute('data-src');
};

galleryImages.forEach((image) => {
const realSrc = image.getAttribute('src');
if (!realSrc || realSrc === lazyPlaceholder) return;
image.dataset.src = realSrc;
image.setAttribute('src', lazyPlaceholder);
image.setAttribute('loading', 'lazy');
image.setAttribute('decoding', 'async');
image.style.cursor = 'pointer';
image.addEventListener('click', () => openLightbox(image));
});

if ('IntersectionObserver' in window) {
const imageObserver = new IntersectionObserver((entries, observer) => {
entries.forEach((entry) => {
if (!entry.isIntersecting) return;
loadLazyImage(entry.target);
observer.unobserve(entry.target);
});
}, {
rootMargin: '200px 0px'
});

galleryImages.forEach((image) => {
if (image.dataset.src) imageObserver.observe(image);
});
} else {
galleryImages.forEach((image) => loadLazyImage(image));
}

lightbox.addEventListener('click', (event) => {
if (event.target === lightbox || event.target === lightboxClose) {
closeLightbox();
}
});

lightboxClose.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (event) => {
if (event.key === 'Escape' && lightbox.classList.contains('active')) {
closeLightbox();
}
});