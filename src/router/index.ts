import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'

import LandingView from '@/views/Landing.vue'
import Dashboard from '@/views/Dashboard.vue'
import ProjectSelection from '@/views/ProjectSelection.vue'
import Benchmark from '@/views/Benchmark.vue'
import NotFound from '@/views/NotFound.vue'
import ReportPage from '@/views/ReportPage.vue'
import ProjectOverview from '@/views/ProjectOverview.vue'

import LoginComponent from '@/components/SpeckleLogin.vue'

import { useSpeckleStore } from '@/stores/speckleStore'
import { useSettingsStore } from '@/stores/settingStore'
import { useNavigationStore } from '@/stores/navigationStore'

/**
 * The router instance for the application.
 */
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'Landing',
			component: LandingView,
			meta: {
				requiresAuth: false,
				title: 'Landing',
				icon: ''
			}
		},
		{
			path: '/login',
			name: 'Login',
			component: LoginComponent,
			meta: {
				requiresAuth: false,
				title: 'Login',
				icon: ''
			}
		},
		{
			path: '/projects/:projectId/overview',
			name: 'Overview',
			component: ProjectOverview,
			meta: {
				requiresAuth: true,
				title: 'Overview',
				icon: ''
			}
		},
		{
			path: '/projects/:projectId/models/:modelId/filtering',
			name: 'Filtering',
			component: Dashboard,
			meta: {
				requiresAuth: true,
				title: 'Filters',
				icon: ''
			}
		},
		{
			path: '/projects/:projectId/models/:modelId/mapping',
			name: 'Mapping',
			component: Dashboard,
			meta: {
				requiresAuth: true,
				title: 'Mapping',
				icon: ''
			}
		},
		{
			path: '/projects/:projectId/models/:modelId/results',
			name: 'Results',
			component: Dashboard,
			meta: {
				requiresAuth: true,
				title: 'Results',
				icon: ''
			}
		},
		{
			path: '/projects',
			name: 'Projects',
			component: ProjectSelection,
			meta: {
				requiresAuth: true,
				title: 'Project Selection',
				icon: ''
			}
		},
		{
			path: '/benchmark',
			name: 'Benchmark',
			component: Benchmark,
			meta: {
				requiresAuth: true,
				title: 'Benchmark',
				icon: ''
			}
		},
		{
			path: '/report',
			name: 'Report',
			component: ReportPage,
			meta: {
				requiresAuth: true,
				title: 'Report',
				icon: ''
			}
		},
		{
			path: '/:catchAll(.*)', // Wildcard for missing routes.
			name: 'NotFound', // 404 page.
			component: NotFound,
			meta: {
				requiresAuth: false,
				title: 'Not Found',
				icon: ''
			}
		}
	]
})

/**
 * A navigation guard function that is executed before each route navigation.
 * It handles the exchange of access codes, updates the user information, and checks for authentication.
 *
 * @param to - The target route location.
 * @returns A route object indicating the next route to navigate to.
 */
const beforeEachGuard = async (to: RouteLocationNormalized) => {
	const speckleStore = useSpeckleStore()
	const settingsStore = useSettingsStore()
	const navigationStore = useNavigationStore()

	if (to.query.access_code) {
		// If the route contains an access code, exchange it.
		let accessCode: string
		if (
			Array.isArray(to.query.access_code) &&
			to.query.access_code[0] != null
		) {
			accessCode = to.query.access_code[0].toString()
		} else {
			accessCode = to.query.access_code.toString()
		}

		// If the access code is not set, return to the home page.
		await speckleStore
			.exchangeAccessCodes(accessCode)
			.then(() => {
				console.warn('Access code exchange was successful', 'info')
				return { name: 'Projects' }
			})
			.catch(() => {
				console.warn('Access code exchange failed', 'warning')
				return { name: 'Home' }
			})
	}
	// Fetch if the user is authenticated.
	await speckleStore
		.updateUser()
		.then(() => {
			console.warn(
				'Updated current user to: ' + speckleStore.getUserInfo?.name,
				'info'
			)
		})
		.then(() => {
			// If the route requires authentication and the user is not authenticated, return to the login page.
			if (to.meta.requiresAuth && !speckleStore.isAuthenticated) {
				if (
					settingsStore.keySettings.speckleConfig.id == undefined ||
					settingsStore.keySettings.speckleConfig.secret == undefined
				) {
					console.log(
						'Speckle credentials are not set, redirecting to project.'
					)
					navigationStore.toggleSettingsModal()
					return { name: 'Projects' }
				} else {
					//logMessageToSentry("User is not authenticated, but the route required it.", 'warning')
					console.log(
						'User is not authenticated, but the route required it and keys exists.'
					)
					speckleStore.login()
					return { name: 'Login' }
				}
			}
			return true
		})
}

router.beforeEach(beforeEachGuard)

export default router
