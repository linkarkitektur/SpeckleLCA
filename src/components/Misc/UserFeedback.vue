<template>
	<div>
		<button @click="showModal = true">Open Modal</button>
		<div v-if="showModal" class="modal">
			<div class="modal-content">
				<span class="close" @click="showModal = false">&times;</span>
				<p>Modal content goes here.</p>
			</div>
		</div>
	</div>
</template>

<script>
	import { ref } from 'vue'

	export default {
		name: 'ModalComponent',
		setup() {
			const showModal = ref(false)

			return {
				showModal
			}
		}
	}
</script>

<style>
	.modal {
		display: block;
		position: fixed;
		z-index: 1;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background-color: rgba(0, 0, 0, 0.4);
	}

	.modal-content {
		background-color: #fefefe;
		margin: 15% auto;
		padding: 20px;
		border: 1px solid #888;
		width: 80%;
	}

	.close {
		color: #aaa;
		float: right;
		font-size: 28px;
		font-weight: bold;
	}

	.close:hover,
	.close:focus {
		color: black;
		text-decoration: none;
		cursor: pointer;
	}
</style>
