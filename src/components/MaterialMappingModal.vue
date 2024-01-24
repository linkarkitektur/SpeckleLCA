<template>
  <div>
    <button @click="openModal" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Open Modal
    </button>

    <div v-if="isModalOpen" class="fixed z-50 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white w-1/2 p-6 rounded shadow">
        </div>
        <div class="bg-white w-1/2 p-6 rounded shadow">
          <!-- Table for groups -->
          <table class="w-full">
            <thead>
              <tr>
                <th>Material</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              <!-- Render materials data here -->
            </tbody>
          </table>
        </div>
        <!-- Close button -->
        <button @click="closeModal" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isModalOpen: false
    };
  },
  methods: {
    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
    }
  }
};
</script>
