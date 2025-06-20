import { ImageBlock } from './blocks/media-block/ImageBlock.fixed';

function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ImageBlock Test</h1>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h2>ImageBlock Component Demo</h2>
        
        <div style={{ marginBottom: '3rem' }}>
          <h2>Responsive Image with srcSet</h2>
          <ImageBlock
            id="hero-image"
            src="/images/hero.jpg"
            srcSet="/images/hero-small.jpg 480w, /images/hero-medium.jpg 768w, /images/hero.jpg 1200w"
            sizes="(max-width: 600px) 480px, (max-width: 1024px) 768px, 1200px"
            alt="A beautiful landscape with mountains and lake"
            width="100%"
            height={500}
            lazy={true}
            borderRadius="md"
            shadow="sm"
            caption="Beautiful landscape with responsive image loading"
            onLoad={() => console.log('Hero image loaded')}
            onError={(e) => console.error('Failed to load hero image', e)}
          />
        </div>
        
        <div style={{ marginBottom: '3rem' }}>
          <h2>Image with Border and Shadow</h2>
          <ImageBlock
            id="landscape-image"
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            alt="Beautiful landscape with mountains and lake"
            width={600}
            height={400}
            borderRadius="lg"
            shadow="md"
            hasBorder
            caption="Image with border and shadow"
          />
        </div>
        
        <div style={{ marginBottom: '3rem' }}>
          <h2>Circular Image</h2>
          <ImageBlock
            id="circular-image"
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            alt="Circular landscape image"
            width={200}
            height={200}
            borderRadius="full"
            objectFit="cover"
            caption="Circular image with cover fit"
          />
        </div>
        
        <div>
          <h2>Basic Image with Lazy Loading</h2>
          <ImageBlock
            id="basic-image"
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            alt="Basic landscape image"
            width={400}
            height={300}
            lazy={true}
            caption="Basic image with lazy loading"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
