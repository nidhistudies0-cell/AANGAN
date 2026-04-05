import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Home/ProfileScreen';
import BrowseInSync from '../screens/InSync/BrowseInSync';
import CreateInSync from '../screens/InSync/CreateInSync';
import BrowseCoLab from '../screens/CoLab/BrowseCoLab';
import CreateCoLab from '../screens/CoLab/CreateCoLab';
import BrowseRequests from '../screens/ShareRing/BrowseRequests';
import CreateRequest from '../screens/ShareRing/CreateRequest';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import GroupChat from '../screens/Chat/GroupChat';
import ReportIssue from '../screens/Home/ReportIssue';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.parchment.background,
          borderTopColor: colors.sand.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.clay.primary,
        tabBarInactiveTintColor: colors.ink.faint,
        tabBarLabelStyle: {
          fontFamily: typography.bodyMedium,
          fontSize: 12,
        }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="InSync" component={BrowseInSync} />
      <Tab.Screen name="CoLab" component={BrowseCoLab} />
      <Tab.Screen name="ShareRing" component={BrowseRequests} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ isAdmin = false }: { isAdmin?: boolean }) {
  if (isAdmin) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="CreateInSync" component={CreateInSync} />
      <Stack.Screen name="CreateCoLab" component={CreateCoLab} />
      <Stack.Screen name="CreateRequest" component={CreateRequest} />
      <Stack.Screen name="GroupChat" component={GroupChat} />
      <Stack.Screen name="ReportIssue" component={ReportIssue} />
    </Stack.Navigator>
  );
}
