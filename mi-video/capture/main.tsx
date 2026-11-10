import React from 'react';
import {createRoot} from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import Dashboard from '../../app/dashboard/page';
import Meals from '../../app/meals/page';
import Tasks from '../../app/tasks/page';
import Us from '../../app/us/page';
import Home from '../../app/page';

const page = new URLSearchParams(location.search).get('page') || 'dashboard';
const Page = {dashboard: Dashboard, meals: Meals, tasks: Tasks, us: Us, landing: Home}[page] || Dashboard;
createRoot(document.getElementById('root')!).render(<Page />);
