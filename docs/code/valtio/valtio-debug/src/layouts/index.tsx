import { Outlet } from '@umijs/max';
// import { matchRoutes } from '@umijs/max';
// import NoPage from '@/pages/NoPage';
// import zhCN from 'antd-mobile/es/locales/zh-CN';
import dayjs from 'dayjs';
// import { ConfigProvider } from 'antd-mobile';
import 'dayjs/locale/zh-cn';
import './style.less';
// import PermissionDenied from '@/pages/PermissionDenied';
// import { useDingLogin } from '@/utils/dingding';
// import { checkInDingTalk, checkMobile } from '@/utils/utils';
// import MobileTips from '@/components/MobileTips';
// import { loginOut } from '@/utils/login';

// const isInMobile = checkMobile();
dayjs.locale('zh-cn');

const BasicLayout: React.FC = () => {
  // const { initialState } = useModel('@@initialState');
  // const { user, setUserData } = useModel('user');
  // const location = useLocation();
  // const [isLogout, setIsLogout] = useState(false);

  // const {
  //   hasLogin,
  //   //  loginLoading, loginInfo,
  //   DingLoginBox,
  // } = useDingLogin({ setUserData });

  return (
    // <ConfigProvider locale={zhCN}>
    <div className="dfzx-h5-page-container">
      <Outlet />
      {/* {isInMobile ? <MobileTips /> : <Outlet />} */}
    </div>
    // </ConfigProvider>
  );
};

export default BasicLayout;
