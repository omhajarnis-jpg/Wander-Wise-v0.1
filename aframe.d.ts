
// Add type definitions for A-Frame elements to be recognized by TypeScript's JSX parser.
// This augments the React JSX namespace to include A-Frame's custom elements without shadowing standard ones.
import 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'a-scene': any;
            'a-camera': any;
            'a-entity': any;
            'a-text': any;
        }
    }
}
