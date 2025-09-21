// FIX: Add type definitions for A-Frame elements to be recognized by TypeScript's JSX parser.
// This augments the global JSX namespace to include A-Frame's custom elements.
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

// FIX: Add an empty export to treat this file as a module. This is required for global augmentations to work correctly.
export {};
