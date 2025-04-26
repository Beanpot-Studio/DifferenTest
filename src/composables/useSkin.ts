import { readonly, ref, type Ref } from 'vue';

interface SkinTheme {
  id: string;
  name: string;
  description: string;
  preview: string; // Path to preview image
  ageRange: string;
}

// Define the available skins data (can be loaded from an API later if needed)
const availableSkinsData: SkinTheme[] = [
  {
    id: 'default',
    name: 'Default Theme',
    description: 'Standard professional theme',
    preview: '/skins/default/preview.png', // Placeholder path
    ageRange: 'All Ages'
  },
  {
    id: 'cats',
    name: 'Playful Cats',
    description: 'Fun cat-themed interface for young learners',
    preview: '/skins/cats/preview.png', // Placeholder path
    ageRange: '5-12'
  }
  // Add more skins here later
];

// Function to apply a specific skin ID to the document
// This can be called from specific pages/layouts when class data is loaded
const applySkinToDocument = (skinId: string) => {
   if (typeof window !== 'undefined') {
      const validSkin = availableSkinsData.some(skin => skin.id === skinId);
      const finalSkinId = validSkin ? skinId : 'default';
      
      document.documentElement.setAttribute('data-theme', finalSkinId);
      
      if (!validSkin) {
          console.warn(`Skin with id "${skinId}" not found. Reverting to default.`);
      }
   }
};

// Export the composable function
export function useSkin() {
  
  // The composable now mainly provides the list and the apply function
  return {
    availableSkins: readonly(ref(availableSkinsData)), // Provide the list 
    applySkin: applySkinToDocument // Provide the function to apply a skin
  };
} 