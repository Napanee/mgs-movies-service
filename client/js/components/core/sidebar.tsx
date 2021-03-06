import {
	ChevronLeft as IconChevronLeft,
	ClassOutlined as IconClassOutlined,
	DashboardOutlined as IconDashboardOutlined,
	LocalMoviesOutlined as IconLocalMoviesOutlined,
	PeopleOutlined as IconPeopleOutlined,
	RecordVoiceOverOutlined as IconRecordVoiceOverOutlined,
} from '@mui/icons-material';
import {
	Divider as MuiDivider,
	Drawer as MuiDrawer,
	IconButton as MuiIconButton,
	List as MuiList,
	ListItemButton as MuiListItemButton,
	ListItemIcon as MuiListItemIcon,
	ListItemText as MuiListItemText,
} from '@mui/material';
import {styled as muiStyled} from '@mui/material/styles';
import {NavLink} from 'react-router-dom';
import styled from 'styled-components';

import {drawerWidth} from '@utils/constants';


type SidebarProps = {
	isOpen: boolean;
	toggleDrawer: () => void;
};

const DrawerHeaderStyled = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding: ${(({theme}) => theme.spacing(0, 1))};
`;

export const DrawerHeader = muiStyled(DrawerHeaderStyled)(({theme}) => ({...theme.mixins.toolbar}));

const Drawer = styled(MuiDrawer)`
	flex-shrink: 0;
	width: ${`${drawerWidth}px`};

	/* stylelint-disable-next-line selector-class-pattern */
	.MuiDrawer-paper {
		box-sizing: border-box;
		width: ${`${drawerWidth}px`};
	}
`;

const Sidebar = ({isOpen, toggleDrawer: handleClick}: SidebarProps) => {
	return (
		<Drawer variant="persistent" anchor="left" open={isOpen}>
			<DrawerHeader>
				<MuiIconButton onClick={handleClick}>
					<IconChevronLeft />
				</MuiIconButton>
			</DrawerHeader>
			<MuiDivider />
			<MuiList>
				<MuiListItemButton component={NavLink} to="/">
					<MuiListItemIcon><IconDashboardOutlined /></MuiListItemIcon>
					<MuiListItemText primary="Dashboard" />
				</MuiListItemButton>
				<MuiListItemButton component={NavLink} to="/movies">
					<MuiListItemIcon><IconLocalMoviesOutlined /></MuiListItemIcon>
					<MuiListItemText primary="Movies" />
				</MuiListItemButton>
				<MuiListItemButton component={NavLink} to="/genres">
					<MuiListItemIcon><IconClassOutlined /></MuiListItemIcon>
					<MuiListItemText primary="Genres" />
				</MuiListItemButton>
				<MuiListItemButton component={NavLink} to="/actors">
					<MuiListItemIcon><IconPeopleOutlined /></MuiListItemIcon>
					<MuiListItemText primary="Actors" />
				</MuiListItemButton>
				<MuiListItemButton component={NavLink} to="/directors">
					<MuiListItemIcon><IconRecordVoiceOverOutlined /></MuiListItemIcon>
					<MuiListItemText primary="Directors" />
				</MuiListItemButton>
			</MuiList>
		</Drawer>
	);
};

export default Sidebar;
