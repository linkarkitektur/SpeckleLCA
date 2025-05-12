<template>
	<div class="flex min-h-screen items-center justify-center">
		<div class="flex gap-2">
			<div
				v-for="i in 3"
				:key="i"
				class="w-6 h-6 bg-neutral-100 styled-element hoverable-sm"
				:style="{
					animation: `pulse 1.5s ease-in-out ${(i - 1) * 0.2}s infinite`
				}"
			/>
		</div>
	</div>
</template>
