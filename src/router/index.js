import { createRouter, createWebHistory } from 'vue-router'
import IndexPage from '../components/index/IndexPage.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'index',
            component: IndexPage,
        },
        {
            path: '/dashboard',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../components/dashboard/TheDashboard.vue'),
            children: [
                {
                    name: 'dashboard',
                    path: '',
                    component: () => import("../components/dashboard/AgentList.vue")
                },
                {
                    name: 'agent',
                    path: 'agent/:agent_id',
                    component: () => import("../components/dashboard/agent-editor/AgentEditor.vue")
                }
            ],
        },
    ],
})

export default router
