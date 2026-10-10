import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useDragControls } from 'motion/react';
import PhoneShell from './components/ui/PhoneShell';
import TabBar from './components/ui/TabBar';
import { ToastProvider } from './components/ui/Toast';
import FlourishCareLogo from './components/FlourishCareLogo';
import { StoreProvider, useStore } from './lib/store';
import { NavProvider, useNav, type Route, type TabKey } from './lib/nav';
import { pushTransition } from './lib/motion';

import HomeScreen from './screens/HomeScreen';
import ChildProfileScreen from './screens/ChildProfileScreen';
import VaccineScreen from './screens/VaccineScreen';
import AccountScreen from './screens/AccountScreen';
import GrowthScreen from './screens/GrowthScreen';
import MilestoneScreen from './screens/MilestoneScreen';
import ScreeningScreen from './screens/ScreeningScreen';
import StimulasiScreen from './screens/StimulasiScreen';
import TanyaAhliScreen from './screens/TanyaAhliScreen';
import LibraryScreen, { ArticleScreen } from './screens/LibraryScreen';
import BookingScreen from './screens/BookingScreen';
import BookingsScreen from './screens/BookingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import NewPasswordSheet from './components/sheets/NewPasswordSheet';
import { takeAuthIntent } from './lib/supabase';

const TAB_KEYS: TabKey[] = ['home', 'child', 'vaccine', 'account'];

function Splash() {
  return (
    <motion.div
      className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-canvas-gradient"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
        <FlourishCareLogo className="w-24 h-24" animated />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4 text-center">
        <div className="text-[24px] tracking-[-0.01em]">FlourishCare</div>
        <div className="text-[15px] text-mute mt-1">Menyiapkan rumah tumbuh kembang</div>
      </motion.div>
    </motion.div>
  );
}

/** A pushed screen: slides in from the right, supports iOS edge swipe to go back. */
function StackLayer({ isTop, onPop, children }: { isTop: boolean; onPop: () => void; children: React.ReactNode }) {
  const controls = useDragControls();
  return (
    <motion.div
      className="absolute inset-0 bg-canvas shadow-[-12px_0_30px_rgba(35,27,22,0.10)]"
      initial={{ x: '100%' }}
      animate={{ x: isTop ? 0 : '-28%' }}
      exit={{ x: '100%' }}
      transition={pushTransition}
      drag={isTop ? 'x' : false}
      dragControls={controls}
      dragListener={false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 1 }}
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.x > 110 || info.velocity.x > 650) onPop();
      }}
      aria-hidden={!isTop}
      style={{ pointerEvents: isTop ? 'auto' : 'none' }}
    >
      {children}
      {/* dim when covered */}
      <motion.div
        className="absolute inset-0 bg-[#231B16] pointer-events-none"
        initial={false}
        animate={{ opacity: isTop ? 0 : 0.06 }}
        transition={pushTransition}
      />
      {/* left edge swipe area */}
      {isTop && (
        <div
          className="absolute left-0 top-0 bottom-0 w-5 z-50"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => controls.start(e)}
          aria-hidden
        />
      )}
    </motion.div>
  );
}

function RouteView({ route, onBack }: { route: Route; onBack: () => void }) {
  switch (route.name) {
    case 'child':
      return <ChildProfileScreen onBack={onBack} />;
    case 'vaccine':
      return <VaccineScreen onBack={onBack} />;
    case 'growth':
      return <GrowthScreen onBack={onBack} />;
    case 'milestone':
      return <MilestoneScreen onBack={onBack} />;
    case 'screening':
      return <ScreeningScreen onBack={onBack} start={route.start} reportId={route.reportId} />;
    case 'stimulasi':
      return <StimulasiScreen onBack={onBack} />;
    case 'qa':
      return <TanyaAhliScreen onBack={onBack} />;
    case 'library':
      return <LibraryScreen onBack={onBack} />;
    case 'article':
      return <ArticleScreen id={route.id} onBack={onBack} />;
    case 'booking':
      return <BookingScreen onBack={onBack} initialCategory={route.category} initialSubCode={route.subCode} initialTherapistId={route.therapistId} />;
    case 'bookings':
      return <BookingsScreen onBack={onBack} />;
    case 'notifications':
      return <NotificationsScreen onBack={onBack} />;
    case 'auth':
      return <AuthScreen onBack={onBack} mode={route.mode} redirect={route.redirect} redirectTab={route.redirectTab} />;
    case 'onboarding':
      return <OnboardingScreen onDone={onBack} onCancel={onBack} />;
    default:
      return null;
  }
}

function TabView({ tab }: { tab: TabKey }) {
  switch (tab) {
    case 'home':
      return <HomeScreen />;
    case 'child':
      return <ChildProfileScreen />;
    case 'vaccine':
      return <VaccineScreen />;
    case 'account':
      return <AccountScreen />;
  }
}

function Shell() {
  const { booting, isAuthed, children, activeChild, recoveryMode, setRecoveryMode, profile } = useStore();
  const nav = useNav();
  const [visited, setVisited] = useState<Set<TabKey>>(() => new Set(['home']));

  // Back from Google: continue to the screen the parent wanted before signing in
  useEffect(() => {
    if (booting || !isAuthed) return;
    const intent = takeAuthIntent<{ redirect?: Route; redirectTab?: TabKey }>();
    if (intent && (intent.redirect || intent.redirectTab)) nav.completeAuth(intent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting, isAuthed]);

  useEffect(() => {
    setVisited((v) => (v.has(nav.tab) ? v : new Set(v).add(nav.tab)));
  }, [nav.tab]);

  useEffect(() => {
    if (!isAuthed) setVisited(new Set(['home']));
  }, [isAuthed]);

  // Clinic staff can use the app without adding a child
  const needsOnboarding = !booting && isAuthed && children.length === 0 && !profile?.isStaff;
  const pushed = nav.stack.length > 0;
  const childScoped = isAuthed && !!activeChild;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Root layer: tab screens + tab bar */}
      <motion.div className="absolute inset-0" initial={false} animate={{ x: pushed ? '-28%' : 0 }} transition={pushTransition}>
        {!booting &&
          TAB_KEYS.filter((k) => visited.has(k) && (k === 'home' || childScoped)).map((k) => {
            const active = k === nav.tab;
            return (
              <motion.div
                key={k}
                className="absolute inset-0"
                initial={false}
                animate={active ? { opacity: 1, scale: 1, visibility: 'visible' } : { opacity: 0, scale: 0.985, transitionEnd: { visibility: 'hidden' } }}
                transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                style={{ pointerEvents: active && !pushed ? 'auto' : 'none' }}
                aria-hidden={!active}
              >
                <TabView tab={k} />
              </motion.div>
            );
          })}
        {!booting && <TabBar active={nav.tab} onChange={nav.setTab} />}
        <motion.div
          className="absolute inset-0 bg-[#231B16] pointer-events-none z-50"
          initial={false}
          animate={{ opacity: pushed ? 0.06 : 0 }}
          transition={pushTransition}
        />
      </motion.div>

      {/* Pushed screens */}
      <AnimatePresence initial={false}>
        {nav.stack.map((entry, i) => (
          <StackLayer key={entry.key} isTop={i === nav.stack.length - 1} onPop={nav.pop}>
            <RouteView route={entry.route} onBack={nav.pop} />
          </StackLayer>
        ))}
      </AnimatePresence>

      {/* First run: add the first child */}
      <AnimatePresence>
        {needsOnboarding && (
          <motion.div
            className="absolute inset-0 z-[60]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={pushTransition}
          >
            <OnboardingScreen firstRun onDone={() => undefined} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{booting && <Splash />}</AnimatePresence>

      <NewPasswordSheet open={recoveryMode && isAuthed} onClose={() => setRecoveryMode(false)} />
    </div>
  );
}

function Root() {
  const { isAuthed } = useStore();
  return (
    <NavProvider isAuthed={isAuthed}>
      <Shell />
    </NavProvider>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <PhoneShell>
        <ToastProvider>
          <StoreProvider>
            <Root />
          </StoreProvider>
        </ToastProvider>
      </PhoneShell>
    </MotionConfig>
  );
}
