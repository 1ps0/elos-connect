<script>
// Define a function to calculate the position of each button based on the constraints
function calculateButtonPositions(buttons, constraints) {
  // Modify the buttons array to include the position of each button
  return buttons.map((button) => {
    // Calculate the position of the button based on the constraints
    const position = {
      x: button.x * constraints.gridSize + constraints.padding,
      y: button.y * constraints.gridSize + constraints.padding
    };

    // Return the modified button object
    return {
      ...button,
      position
    };
  });
}

// Use props and state effectively to pass data and handle updates
export let buttons;
export let constraints;

const buttonPositions = writable(null);

$: {
  // Calculate the position of each button based on the constraints
  buttonPositions.set(calculateButtonPositions(buttons, constraints));
}

// Use Svelte's built-in features to create a more flexible and efficient component
function handleClick(button) {
  // Perform the linked function when a button is clicked
  button.func();
}

</script>

<section class="button-grid">
  {#each buttons as button}
    <div class="button" on:click={() => button.onClick()}>
      <i class="button-icon {button.icon}"></i>
    </div>
  {/each}
</section>

<style>
  /* Define styles for the buttons */
  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-in-out;
  }
  .button:hover {
    transform: scale(1.1);
  }
  .button-icon {
    font-size: 18px;
    color: #333;
  }

  /* Define styles for the button grid container */
  .button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    grid-gap: 10px;
  }
</style>
