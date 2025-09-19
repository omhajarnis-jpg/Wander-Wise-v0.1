// FIX: Broaden types for A-Frame elements to 'any' to ensure compatibility with React's JSX type checking.
// Using 'declare global' to ensure these types are available globally.
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'a-scene': any;
            'a-camera': any;
            'a-entity': any;
            'a-text': any;
        }
    }
}
