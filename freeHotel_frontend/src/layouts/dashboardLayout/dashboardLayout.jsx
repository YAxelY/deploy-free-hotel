import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/sidebar/sidebar.jsx'


export default function DashboardLayout() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    const toggleSidebar = () => {
        setIsSidebarExpanded(prev => !prev);
    };
    
    useEffect(() => {
        const handleResize = () => {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
        if(mobile) setIsSidebarExpanded(false);
        };
            
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

  return (
    <>
        <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} isMobile={isMobile} />

        <main>
            <Outlet />
        </main>

    </>
  )
}
