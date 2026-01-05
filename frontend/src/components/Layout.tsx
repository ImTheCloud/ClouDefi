import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Button } from './UI'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/challenges', label: 'Challenges' },
]

const Layout = ({
                  children,
                  userEmail,
                  onLogout,
                }: {
  children: ReactNode
  userEmail: string | null
  onLogout: () => void
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
      <div className="layout">
        <aside className="sidebar">
          <div className="brand" onClick={() => navigate('/')}>
            <div className="dot" />
            <div>
              <p className="brand-name">Challenges Planner</p>
            </div>
          </div>
          <nav>
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        ['nav-link', isActive ? 'active' : '', location.pathname === item.to ? 'current' : '']
                            .filter(Boolean)
                            .join(' ')
                    }
                >
                  {item.label}
                </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="avatar">{userEmail?.[0]?.toUpperCase() ?? '?'}</div>
              <div>
                <p className="user-email">{userEmail}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onLogout}>
              Déconnexion
            </Button>
          </div>
        </aside>
        <div className="content">
          <main>{children}</main>
        </div>
      </div>
  )
}

export default Layout