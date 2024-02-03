<template>
	<Listbox as="div" v-model="selected">
		<h3
			class="font-semibold text-right leading-5 text-gray-400 border-b border-gray-300 pb-2"
		>
			Geometry Filter
		</h3>
		<div class="absolute right-4 mt-3">
			<ListboxButton
				class="relative w-24 cursor-default rounded-md bg-white py-1.5 pl-3 text-left text-gray-400 shadow-sm ring-1 ring-inset ring-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 sm:text-sm sm:leading-6"
			>
				<span class="block truncate">{{ selected.name }}</span>
				<span
					class="pointer-events-none absolute inset-y-0 right-0 flex items-center 0"
				>
					<ChevronUpDownIcon class="h-6 w-6 text-gray-400" aria-hidden="true" />
				</span>
			</ListboxButton>

			<transition
				enter-active-class="transition ease-in duration-300"
				enter-from-class="opacity-0"
				enter-to-class="opacity-100"
				leave-active-class="transition ease-in duration-300"
				leave-from-class="opacity-100"
				leave-to-class="opacity-0"
			>
				<ListboxOptions
					class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white text-base shadow-md ring-1 ring-gray-400 ring-opacity-50 focus:outline-none sm:text-sm"
				>
					<ListboxOption
						as="template"
						v-for="type in types"
						:key="type.id"
						:value="type"
						v-slot="{ active, selected }"
					>
						<li
							:class="[
								active ? 'bg-gray-200 text-gray-500' : 'text-gray-400',
								'relative cursor-default select-none py-2 pl-3 pr-7'
							]"
						>
							<span
								:class="[
									selected ? 'font-bold' : 'font-normal',
									'block truncate'
								]"
								>{{ type.name }}</span
							>

							<span
								v-if="selected"
								:class="[
									active ? 'text-white' : 'text-gray-400',
									'absolute inset-y-0 right-0 flex items-center pr-4'
								]"
							>
								<CheckIcon class="h-5 w-5" aria-hidden="true" />
							</span>
						</li>
					</ListboxOption>
				</ListboxOptions>
			</transition>
		</div>
	</Listbox>
</template>

<script setup lang="ts">
	import { ref, watch, defineEmits } from 'vue'
	import {
		Listbox,
		ListboxButton,
		ListboxOption,
		ListboxOptions
	} from '@headlessui/vue'
	import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

	const types = [
		{ id: 1, name: 'All' },
		{ id: 2, name: 'Mesh' },
		{ id: 3, name: 'Brep' }
	]

	const selected = ref(types[0])

	const emits = defineEmits(['selected'])

	// Watch for a change in selected filter and emit to parent.
	watch(selected, (newValue) => {
		emits('selected', newValue)
	})
</script>
