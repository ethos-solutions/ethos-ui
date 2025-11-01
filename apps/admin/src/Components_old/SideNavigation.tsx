import { NavLink } from 'react-router-dom';
import { ROUTES } from '../helpers/constants';
import { Business } from '@mui/icons-material';

interface Props {
  collapsed?: boolean;
}

export default function SideNavigation({ collapsed }: Props) {
  return (
    <nav className="p-2 pt-16">
      <ul>
        <li>
          <NavLink
            to={ROUTES.DASHBOARD}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded px-3 py-2 hover:bg-gray-100 ${
                isActive ? 'bg-gray-200 font-medium' : ''
              }`
            }
          >
            <Business fontSize="small" />
            {!collapsed && <span>Organisation</span>}
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
