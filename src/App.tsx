
/**
 * App Component
 * -------------
 * Author: Marissa Abao
 *
 * Description:
 * This component serves as the root of the Tamagotchi application.
 * At this early stage, it provides a clean and minimal starting point
 * after removing the default Vite + React template.
 *
 * Purpose:
 * - Display a simple title and introductory message.
 * - Establish a foundational React component that will be expanded
 *   as the Tamagotchi project grows.
 *
 * UI Structure:
 * - <div> : Container that wraps the content.
 * - <h1>  : Main application title (“Tamagotchi”).
 * - <p>   : Short description introducing the virtual pet.
 *
 * Notes:
 * - This component currently contains no logic, state, or interactivity.
 * - Future development will add:
 *     • Pet stats (hunger, happiness, energy)
 *     • Buttons for interactions (Feed, Play, Sleep)
 *     • A timed loop to simulate time passing
 *     • Visual graphics for the pet
 *
 * Export:
 * The `export default App;` statement allows this component
 * to be imported and rendered inside `main.tsx`.
 */

function App() {
  return (
    <div>
      <h1>Tamagotchi</h1>
      <p>Let’s start building your virtual pet! 🐣</p>
    </div>
  );
}

export default App;
