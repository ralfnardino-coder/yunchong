import { checkBlindBoxTrigger, openBlindBox } from './blindBox';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  Trophy, 
  Store, 
  History, 
  Settings, 
  Plus, 
  Minus, 
  Search, 
  X, 
  ChevronRight, 
  ChevronDown,
  LogOut, 
  Settings2, 
  Users, 
  GraduationCap,
  Sparkles,
  Book,
  HeartHandshake,
  Gem,
  Clock,
  Eye,
  FileX,
  Scissors,
  Sunrise,
  Cookie,
  FileText,
  Trash2,
  Pencil,
  Download,
  Upload,
  UserPlus,
  UserMinus,
  PlusCircle,
  Star,
  RefreshCw,
  RotateCcw,
  User,
  LogIn,
  Baby,
  Undo2,
  AlertTriangle,
  Heart,
  PawPrint,
  Smartphone,
  Mail,
  Zap,
  Lock,
  Monitor,
  EyeOff,
  Info,
  Check,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Student, 
  Pet, 
  Class, 
  ScoringRule, 
  StoreItem, 
  Log, 
  GrowthConfig, 
  BlindBoxItem, 
  InventoryItem, 
  Rarity 
} from './types';
import { 
  PETS, 
  SCORING_RULES, 
  DEFAULT_GROWTH_CONFIG, 
  DEFAULT_STORE_ITEMS, 
  BLIND_BOX_UNLOCK_LEVEL, 
  BLIND_BOX_COST, 
  BLIND_BOX_POOL, 
  RARITY_CONFIG 
} from './constants';
import { getMayorAdvice } from './lib/gemini';

const AUTHORIZED_KEYS = [
  'PET-MAGIC-2024', 'PET-STUDY-8888', 'PET-HAPPY- TOWN', 'PET-GLOW-7777', 'PET-DREAM-6666',
  'PET-LOVE-5210', 'PET-STAR-1234', 'PET-SHINE-9999', 'PET-WISH-1111', 'PET-BOND-2025',
  'PET-JUMP-3333', 'PET-FLUFF-4444', 'PET-PAWS-5555', 'PET-CUTE-0001', 'PET-MINI-0002',
  'PET-KIDS-2024', 'PET-EDU-6789', 'PET-GROW-5678', 'PET-PURE-4321', 'PET-JOY-8888'
];

const MACARON_COLORS = [
  'bg-[#CBDB8A]', // 樱花粉 (Actually Mint now)
  'bg-[#E5F2BF]', // 薄荷绿 (Actually Light Mint)
  'bg-[#E6E6FA]', // 薰衣草
  'bg-[#FFF5BA]', // 柠檬黄
  'bg-[#D1E9FF]', // 天空蓝
  'bg-[#FFE5D9]', // 蜜桃肉
  'bg-[#FFCAD4]', // 蔷薇粉
  'bg-[#F4FAFF]', // 冰晶蓝
  'bg-[#DCEDC8]', // 抹茶绿
  'bg-[#F3E5F5]', //梦幻紫
];

const TABS = [
  { id: 'home', label: '主页', icon: LayoutDashboard },
  { id: 'rankings', label: '荣誉榜', icon: Trophy },
  { id: 'store', label: '萌宠小店', icon: Store },
  { id: 'records', label: '成长日记', icon: History },
  { id: 'settings', label: '设置', icon: Settings },
];

// --- Evolution Helpers ---
const AVAILABLE_PET_STAGES: Record<string, number[]> = {
  '小猪猪': [1, 3, 5, 7],
  '蓝猫': [1, 3, 5, 7],
  '柯基': [1, 3, 5, 7],
  '九尾狐': [1, 3, 5, 7],
  '北极熊': [1, 3, 5, 7],
  '多肉精灵': [1, 3, 5, 7],
  '布偶猫': [1, 3, 5, 7],
  '柯尔鸭': [1, 3, 5, 7],
  '柴犬': [1, 3, 5, 7],
  '比熊犬': [1, 3, 5, 7],
  '法斗犬': [1, 3, 5, 7],
  '独角兽': [1, 3, 5, 7],
  '猴子': [1, 3, 5, 7],
  '白虎': [1, 3, 5, 7],
  '虎皮鹦鹉': [1, 3, 5, 7],
  '金毛': [1, 3, 5, 7],
  '小花豹': [1, 3, 5, 7],
  '朱雀鸟': [1, 3, 5, 7],
  '羊驼': [1, 3, 5, 7],
  '青龙': [1, 3, 5, 7],
  '貔貅': [1, 3, 5, 7],
  '泰迪犬': [1, 3, 5, 7],
  '熊猫': [1, 3, 5, 7],
  '银渐层猫': [1, 3, 5, 7],
  '西高地犬': [1, 3, 5, 7],
  '金渐层': [1, 3, 5, 7],
  '小白兔': [1, 3, 5, 7],
  '小马驹': [1, 3, 5, 7],
  '雪纳瑞': [1, 3, 5, 7],
  '小熊猫': [1, 3, 5, 7]
};

const getLevelUpMessage = (studentName: string, level: number) => {
  const mayorPrefix = "镇长大人：";
  switch(level) {
    case 3: return `${mayorPrefix}哇！形态进化！${studentName}的小宠看起来更有活力了！`;
    case 5: return `${mayorPrefix}快看！身体变强壮了！我们的冒险才刚刚开始呢！`;
    case 7: return `${mayorPrefix}灵力爆发！终极形态达成！你现在是小镇最出色的守护者！`;
    default: return `${mayorPrefix}继续加油，小宠在期待下一次神奇变身！`;
  }
};

const resolvePetImage = (pet: Pet | undefined, level: number, forceMax: boolean = false) => {
  if (!pet || !pet.imageUrl) return '';
  const petName = pet.name;
  
  // 按照需求：
  // 1、2 级用 1 阶段图 (Lv.1)
  // 3、4 级用 3 阶段图 (Lv.3)
  // 5、6 级用 5 阶段图 (Lv.5)
  // 7 级用 7 阶段图 (Lv.7)
  let activeStage = 1;
  if (forceMax) {
    activeStage = 7;
  } else {
    // 阶梯式逻辑：1,3,5,7
    if (level <= 2) activeStage = 1;
    else if (level <= 4) activeStage = 3;
    else if (level <= 6) activeStage = 5;
    else activeStage = 7;
  }
  
  // Get extension from current pet image URL (e.g., .jpg or .png)
  const extensionMatch = pet.imageUrl.match(/\.[^.]+$/);
  const ext = extensionMatch ? extensionMatch[0] : '.jpg';

  return encodeURI(`/pets/${petName}Lv.${activeStage}${ext}`);
};

const PetDisplay = ({ pet, level, forceMax = false, fill = false, className = "" }: { pet: Pet | undefined, level: number, forceMax?: boolean, fill?: boolean, className?: string }) => {
  const imageUrl = resolvePetImage(pet, level, forceMax);
  const displayLevel = forceMax ? 7 : level;
  
  return (
    <div className={`relative flex items-center justify-center w-full h-full ${className}`}>
      {/* Background Glow */}
      <AnimatePresence>
        {displayLevel >= 7 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-200/40 rounded-full blur-2xl"
          />
        )}
      </AnimatePresence>

      {/* Main Pet Image */}
      <motion.img 
          animate={{ 
            scale: 1.1 + (displayLevel - 1) * 0.08,
            y: [0, -6, 0] 
          }}
          transition={{ 
            y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
            scale: { type: "spring", stiffness: 100 }
          }}
          src={imageUrl} 
          alt={pet?.name} 
          className={`${fill ? 'w-full h-full object-cover' : 'w-[85%] h-[85%] object-contain'} cloud-pet relative z-10`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = pet?.imageUrl || '';
          }}
      />

      {/* Decorations Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Lv.7 Sparkles */}
        {displayLevel >= 7 && (
          <div className="absolute inset-0">
             {[...Array(5)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                 transition={{ 
                   duration: 1.5, 
                   repeat: Infinity, 
                   delay: i * 0.3,
                   times: [0, 0.5, 1]
                 }}
                 className="absolute text-yellow-400 font-bold text-lg"
                 style={{ 
                   top: `${Math.random() * 80 + 10}%`, 
                   left: `${Math.random() * 80 + 10}%` 
                 }}
               >
                 ✨
               </motion.div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

type SortBy = 'name' | 'surname' | 'no' | 'points' | 'level';

export default function App() {
  // State
  const [viewMode, setViewMode] = useState<'login' | 'teacher'>('login');
  const [activeTab, setActiveTab] = useState('home');
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClassId, setCurrentClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>(SCORING_RULES);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPetSelectModalOpen, setIsPetSelectModalOpen] = useState(false);
  const [growthConfigs, setGrowthConfigs] = useState<GrowthConfig[]>(DEFAULT_GROWTH_CONFIG);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editingStudentData, setEditingStudentData] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [levelUpAnimation, setLevelUpAnimation] = useState<{ student: Student, oldLevel: number } | null>(null);
  
  const [teacherAccount, setTeacherAccount] = useState<string>('');
  const [accountPassword, setAccountPassword] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [loginPasswordInput, setLoginPasswordInput] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [loginRole, setLoginRole] = useState<'teacher'>('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  
  const [lockPassword, setLockPassword] = useState<string>('');
  const [lockSafetyCode, setLockSafetyCode] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState<string>('study');
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleData, setEditingRuleData] = useState<ScoringRule | null>(null);
  const [isSettingLock, setIsSettingLock] = useState<boolean>(false);
  const [tempPassword, setTempPassword] = useState<string>('');
  const [tempSafetyCode, setTempSafetyCode] = useState<string>('');
  const [unlockInput, setUnlockInput] = useState<string>('');

  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [levelUpInfo, setLevelUpInfo] = useState<{ studentName: string; level: number; pet: Pet } | null>(null);
  const [aiMayorMsg, setAiMayorMsg] = useState<string>('');

  // --- 授权码系统 (Access Control) ---
  const [isAppAuthorized, setIsAppAuthorized] = useState<boolean>(() => {
    return localStorage.getItem('clp_app_authorized') === 'true';
  });
  const [authKeyInput, setAuthKeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // --- Utils ---
  const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

  // Helper: Get points for next level and current level progress
  const getLevelProgress = (points: number, configs: GrowthConfig[]) => {
    let currentLevel = 1;
    let nextLevelPoints = configs[0].pointsRequired;

    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        if (points >= config.pointsRequired) {
            currentLevel = config.level + 1;
            if (i + 1 < configs.length) {
                nextLevelPoints = configs[i+1].pointsRequired;
            } else {
                nextLevelPoints = config.pointsRequired; // Max
            }
        } else {
            break;
        }
    }
    
    return { 
        level: currentLevel, 
        currentLevelPoints: points, 
        nextLevelPoints: nextLevelPoints,
        pointsRemaining: Math.max(0, nextLevelPoints - points)
    };
  };
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchType, setBatchType] = useState<'evaluate' | 'delete' | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [scoringCategory, setScoringCategory] = useState<string>('all');
  const [settingsSubTab, setSettingsSubTab] = useState<'rules' | 'growth' | 'data' | 'help'>('rules');

  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStoreItem, setEditingStoreItem] = useState<StoreItem | null>(null);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [selectedItemToRedeem, setSelectedItemToRedeem] = useState<StoreItem | null>(null);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  // --- 盲盒系统状态 ---
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isBlindBoxOpen, setIsBlindBoxOpen] = useState(false);
  const [blindBoxLoading, setBlindBoxLoading] = useState(false);
  const [blindBoxResult, setBlindBoxResult] = useState<BlindBoxItem | null>(null);

  // Initialize data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedClasses = localStorage.getItem('cp_classes');
        const savedStudents = localStorage.getItem('cp_students');
        const savedLogs = localStorage.getItem('cp_logs');
        const savedRules = localStorage.getItem('cp_scoring_rules');
        const savedStoreItems = localStorage.getItem('cp_store_items');
        const savedGrowthConfigs = localStorage.getItem('cp_growth_configs');
        const savedAccountPass = localStorage.getItem('cp_account_password');
        const savedTeacherAccount = localStorage.getItem('cp_teacher_account');
        const savedIsRegistered = localStorage.getItem('cp_is_registered');
        const savedPassword = localStorage.getItem('cp_lock_password');
        const savedInventory = localStorage.getItem('cp_inventory');
        
        let initialClasses: Class[] = [];
        if (savedClasses) {
          try {
            initialClasses = JSON.parse(savedClasses);
            setClasses(initialClasses);
          } catch (e) {
            initialClasses = [{ id: 'c1', name: '一年级1班' }];
            setClasses(initialClasses);
          }
        } else {
          initialClasses = [{ id: 'c1', name: '一年级1班' }];
          setClasses(initialClasses);
        }

        if (initialClasses.length > 0) {
          setCurrentClassId(initialClasses[0].id);
        }
        
        if (savedStudents) {
          try {
            const parsedStudents = JSON.parse(savedStudents);
            setStudents(parsedStudents);
          } catch (e) {
            setStudents([]);
          }
        } else {
          // Add mock students for first-time onboarding
          setStudents([
            { id: 's1', name: '小团子', points: 45, petId: 'piggy', level: 3, classId: 'c1', medals: 3 },
            { id: 's2', name: '乐乐', points: 12, petId: 'shiba', level: 1, classId: 'c1', medals: 0 }
          ]);
        }
        
        if (savedLogs) {
          try {
            setLogs(JSON.parse(savedLogs));
          } catch (e) {
            setLogs([]);
          }
        }
        
        if (savedRules) {
          try {
            setScoringRules(JSON.parse(savedRules));
          } catch (e) {
            setScoringRules(SCORING_RULES);
          }
        }

        if (savedStoreItems) {
          try {
            setStoreItems(JSON.parse(savedStoreItems));
          } catch (e) {
            setStoreItems(DEFAULT_STORE_ITEMS);
          }
        } else {
          setStoreItems(DEFAULT_STORE_ITEMS);
        }

        if (savedGrowthConfigs) {
          try {
            setGrowthConfigs(JSON.parse(savedGrowthConfigs));
          } catch (e) {
            setGrowthConfigs(DEFAULT_GROWTH_CONFIG);
          }
        } else {
          setGrowthConfigs(DEFAULT_GROWTH_CONFIG);
        }

        if (savedInventory) {
          try {
            setInventory(JSON.parse(savedInventory));
          } catch (e) {
            setInventory([]);
          }
        }

        if (savedAccountPass) setAccountPassword(savedAccountPass);
        if (savedTeacherAccount) setTeacherAccount(savedTeacherAccount);
        if (savedIsRegistered) {
          try {
            setIsRegistered(JSON.parse(savedIsRegistered));
          } catch (e) {
            setIsRegistered(false);
          }
        }
        if (savedPassword) setLockPassword(savedPassword);

        // 检查全局授权
        const savedAuth = localStorage.getItem('cp_app_authorized');
        if (savedAuth === 'true') {
          setIsAppAuthorized(true);
        }
      } catch (err) {
        console.error("Critical: Data loading failed", err);
      }
    };
    
    loadData();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cp_classes', JSON.stringify(classes));
  }, [classes]);
  useEffect(() => {
    localStorage.setItem('cp_students', JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem('cp_logs', JSON.stringify(logs));
  }, [logs]);
  useEffect(() => {
    localStorage.setItem('cp_scoring_rules', JSON.stringify(scoringRules));
  }, [scoringRules]);
  useEffect(() => {
    localStorage.setItem('cp_store_items', JSON.stringify(storeItems));
  }, [storeItems]);
  useEffect(() => {
    localStorage.setItem('cp_growth_configs', JSON.stringify(growthConfigs));
  }, [growthConfigs]);
  useEffect(() => {
    localStorage.setItem('cp_account_password', accountPassword);
  }, [accountPassword]);
  useEffect(() => {
    localStorage.setItem('cp_teacher_account', teacherAccount);
  }, [teacherAccount]);
  useEffect(() => {
    localStorage.setItem('cp_is_registered', JSON.stringify(isRegistered));
  }, [isRegistered]);
  useEffect(() => {
    localStorage.setItem('cp_inventory', JSON.stringify(inventory));
  }, [inventory]);

  const saveLockSettings = (pass: string, safety: string) => {
    setLockPassword(pass);
    setLockSafetyCode(safety);
    localStorage.setItem('cp_lock_password', pass);
    localStorage.setItem('cp_lock_safety_code', safety);
    setIsSettingLock(false);
  };

  // Derived state
  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId), [classes, currentClassId]);
  
  // All students for current class (for management)
  const allClassStudents = useMemo(() => students.filter(s => s.classId === currentClassId), [students, currentClassId]);

  const classStudents = useMemo(() => {
    let list = allClassStudents.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    } else if (sortBy === 'surname') {
      list = [...list].sort((a, b) => a.name.slice(0, 1).localeCompare(b.name.slice(0, 1), 'zh-CN'));
    } else if (sortBy === 'points') {
      list = [...list].sort((a, b) => b.points - a.points);
    } else if (sortBy === 'level') {
      list = [...list].sort((a, b) => b.level - a.level);
    } else if (sortBy === 'no') {
      list = [...list].sort((a, b) => (a.studentNo || '').localeCompare(b.studentNo || ''));
    }
    
    return list;
  }, [students, currentClassId, searchTerm, sortBy]);

  const activeGradStats = useMemo(() => {
    const total = classStudents.length;
    const graduated = classStudents.filter(s => s.level >= 9).length;
    return { total, graduated };
  }, [classStudents]);

  const visibleStudents = useMemo(() => {
    return classStudents;
  }, [classStudents]);

  const visibleLogs = useMemo(() => {
    return logs;
  }, [logs]);

  // Actions
  const redeemItem = (studentId: string, item: StoreItem) => {
    if (item.stock <= 0) {
      alert('库存不足惹~');
      return;
    }
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    if (student.points < item.price) {
      alert('积分不够呢，再接再厉喔！');
      return;
    }

    // Deduct points
    updatePoints(studentId, {
      id: 'redeem-' + generateId(),
      label: `在小商店兑换了: ${item.name}`,
      points: -item.price,
      type: 'minus',
      category: 'other',
      icon: 'Store'
    });

    // Reduce stock
    setStoreItems(prev => prev.map(si => si.id === item.id ? { ...si, stock: si.stock - 1 } : si));

    alert(`兑换成功！已为 ${student.name} 兑换了 ${item.name}。`);
  };

  const addStoreItem = (item: Omit<StoreItem, 'id'>) => {
    const newItem: StoreItem = {
      ...item,
      id: 'st-' + generateId()
    };
    setStoreItems([...storeItems, newItem]);
  };

  const updateStoreItem = (itemId: string, updates: Partial<StoreItem>) => {
    setStoreItems(storeItems.map(item => item.id === itemId ? { ...item, ...updates } : item));
  };

  const deleteStoreItem = (itemId: string) => {
    if (confirm('确定要删除这个项目吗？')) {
      setStoreItems(storeItems.filter(item => item.id !== itemId));
    }
  };

  const addClass = (name: string) => {
    const newClass: Class = { id: generateId(), name };
    setClasses([...classes, newClass]);
    setCurrentClassId(newClass.id);
  };

  const removeClass = (id: string) => {
    // 先更新学生列表
    setStudents(prev => prev.filter(s => s.classId !== id));
    
    // 再更新班级列表
    setClasses(prev => {
      const updated = prev.filter(c => c.id !== id);
      // 如果删除的是当前选中的班级，自动切换到第一个班级
      if (currentClassId === id) {
        if (updated.length > 0) {
          setCurrentClassId(updated[0].id);
        } else {
          setCurrentClassId('');
        }
      }
      return updated;
    });
    setClassToDelete(null);
  };

  const addStudent = (name: string, studentNo?: string) => {
    if (!currentClassId) return;
    const newStudent: Student = {
      id: generateId(),
      name,
      studentNo,
      points: 0,
      petId: null, // Start as egg
      level: 1,
      classId: currentClassId,
      medals: 0,
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    if (selectedStudent?.id === id) {
        setSelectedStudent(null);
    }
    // Also clear from batch selection if present
    setSelectedStudentIds(prev => prev.filter(sid => sid !== id));
  };

  const addScoringRule = (rule: Omit<ScoringRule, 'id'>) => {
    const newRule: ScoringRule = { ...rule, id: generateId() };
    setScoringRules(prev => [...prev, newRule]);
  };

  const updateScoringRule = (id: string, updates: Partial<ScoringRule>) => {
    setScoringRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeScoringRule = (id: string) => {
    if (window.confirm('确定要删除这项评价指标吗？')) {
      setScoringRules(prev => prev.filter(r => r.id !== id));
    }
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ 警告：这将彻底清空系统内所有数据（包含班级、学生、评价记录等），该操作不可撤销！')) {
        if (window.confirm('这是最后一次确认，您真的要彻底重置系统吗？所有自定义规则和盲盒记录也将消失。')) {
            // Full Reset
            setClasses([{ id: 'c1', name: '一年级1班' }]);
            setCurrentClassId('c1');
            setStudents([
                { id: 's1', name: '小团子', points: 45, petId: 'piggy', level: 3, classId: 'c1', medals: 3 },
                { id: 's2', name: '乐乐', points: 12, petId: 'shiba', level: 1, classId: 'c1', medals: 0 }
            ]);
            setLogs([]);
            setScoringRules(SCORING_RULES);
            setGrowthConfigs(DEFAULT_GROWTH_CONFIG);
            setStoreItems(DEFAULT_STORE_ITEMS);
            setInventory([]);
            setSearchTerm('');
            alert('系统已恢复至初始默认状态。');
        }
    }
  };

  const importExcelStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentClassId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];

        const newStudents: Student[] = json.map((row: any) => ({
          id: generateId(),
          name: (row.姓名 || row.名字 || row.name || '未知').toString(),
          studentNo: (row.学号 || row.no || row.studentNo || '').toString(),
          points: 0,
          petId: null, // Initially no pet
          level: 1,
          classId: currentClassId,
          medals: 0
        }));

        if (newStudents.length > 0) {
          setStudents(prev => [...prev, ...newStudents]);
          alert(`成功导入 ${newStudents.length} 名学生！提示：新导入的学生需要点击“蛋”来领养宠物喔。`);
        }
      } catch (err) {
        console.error('Excel Import Error:', err);
        alert('解析 Excel 失败，请确保格式正确（包含 姓名 和 学号 列）');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- 盲盒抽取核心逻辑 ---
  const handleOpenBlindBox = () => {
    // 确定目标学生（家长端用选中的宝贝，老师端默认用第一个作为演示或需要选择逻辑）
    const targetStudent = students[0];
    
    if (!targetStudent) {
      alert("请先选择或添加一名学生！");
      return;
    }

    // 检查等级是否达到解锁要求
    if (targetStudent.level < BLIND_BOX_UNLOCK_LEVEL) {
      alert(`盲盒功能在第 ${BLIND_BOX_UNLOCK_LEVEL} 关解锁。当前等级：第 ${targetStudent.level} 关`);
      return;
    }
    
    // 1. 检查积分是否足够
    if (targetStudent.points < BLIND_BOX_COST) {
      alert(`积分不足！开启盲盒需要 ${BLIND_BOX_COST} 积分。`);
      return;
    }

    // 2. 防止连点
    if (blindBoxLoading) return;

    setBlindBoxLoading(true);
    setBlindBoxResult(null);

    // 3. 模拟加载/抽奖过渡效果
    setTimeout(() => {
      // 4. 稀有度概率计算
      const randomValue = Math.random() * 100;
      let selectedRarity: Rarity = 'common';
      let cumulativeWeight = 0;

      const rarityEntries = Object.entries(RARITY_CONFIG) as [Rarity, typeof RARITY_CONFIG.common][];
      for (const [rarity, config] of rarityEntries) {
        cumulativeWeight += config.weight;
        if (randomValue <= cumulativeWeight) {
          selectedRarity = rarity;
          break;
        }
      }

      // 5. 从对应稀有度的奖池中随机抽取一件
      const possibleItems = BLIND_BOX_POOL.filter(item => item.rarity === selectedRarity);
      // 如果该稀有度没有物品（兜底），随机选一个普通
      const pool = possibleItems.length > 0 ? possibleItems : BLIND_BOX_POOL.filter(i => i.rarity === 'common');
      const wonItem = pool[Math.floor(Math.random() * pool.length)];

      // 6. 更新数据：扣除积分并加入背包
      setStudents(prev => prev.map(s => 
        s.id === targetStudent.id ? { ...s, points: s.points - BLIND_BOX_COST } : s
      ));

      const newInventoryItem: InventoryItem = {
        ...wonItem,
        obtainedAt: new Date().toLocaleString(),
      };
      setInventory(prev => [newInventoryItem, ...prev]);

      // 7. 展示结果
      setBlindBoxResult(wonItem);
      setBlindBoxLoading(false);
    }, 2000); // 2秒加载效果
  };

  const confirmDeleteBatch = () => {
    if (selectedStudentIds.length === 0) return;
    if (window.confirm(`确定要移除选中的 ${selectedStudentIds.length} 位同学吗？该班级小镇将不再有他们的足迹。`)) {
      setStudents(prev => prev.filter(s => !selectedStudentIds.includes(s.id)));
      setSelectedStudentIds([]);
      setIsBatchMode(false);
      setBatchType(null);
    }
  };

  const updatePoints = (studentId: string, rule: ScoringRule) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newPoints = student.points + rule.points;
    let newLevel = student.level;
    
    // Simple level up logic
    const config = growthConfigs;
    let tempLevel = student.level;
    let leveledUp = false;
    
    // Check for level up repeatedly in case of multiple jumps
    while (tempLevel < 7) {
      const currentLevelConfig = config.find(c => c.level === tempLevel);
      if (currentLevelConfig && newPoints >= currentLevelConfig.pointsRequired) {
        tempLevel++;
        leveledUp = true;
      } else {
        break;
      }
    }
    
    newLevel = tempLevel;

    // Handle level-up events
    if (leveledUp) {
        const pet = PETS.find(p => p.id === student.petId);
        if (pet) {
            // Fetch AI Mayor message
            getMayorAdvice(student.name, tempLevel, pet.name).then(msg => setAiMayorMsg(msg));
            
            // Force a small delay to ensure students state is updated or handle it immediately
            setTimeout(() => {
                setLevelUpInfo({
                    studentName: student.name,
                    level: tempLevel,
                    pet: pet
                });
            }, 100);
        }

        // Trigger Blind Box if level matches
        if (checkBlindBoxTrigger(tempLevel)) {
            setTimeout(() => openBlindBox(), 1500); // Open after congrats message
        }
    }

    setStudents(students.map(s => s.id === studentId ? { ...s, points: newPoints, level: newLevel } : s));
    
    const log: Log = {
      id: generateId(),
      studentId,
      studentName: student.name,
      ruleLabel: rule.label,
      points: rule.points,
      timestamp: new Date().toLocaleString(),
    };
    setLogs([log, ...logs]);
  };

  const undoLastLog = () => {
    if (logs.length === 0) return;
    const lastLog = logs[0];
    const student = students.find(s => s.id === lastLog.studentId);
    if (!student) return;

    // Revert points
    const newPoints = student.points - lastLog.points;
    
    // Also revert stock if it was a redemption
    if (lastLog.id === 'redeem') {
        const itemName = lastLog.ruleLabel.replace('在小商店兑换了: ', '');
        setStoreItems(prev => prev.map(item => 
          item.name === itemName ? { ...item, stock: item.stock + 1 } : item
        ));
    }

    // Simple level recalculation or just keep current (for safety we revert strictly)
    setStudents(students.map(s => s.id === lastLog.studentId ? { ...s, points: newPoints } : s));
    setLogs(logs.slice(1));
    alert(`成功撤回对 ${lastLog.studentName} 的评价：${lastLog.ruleLabel} (${lastLog.points > 0 ? '+' : ''}${lastLog.points})`);
  };

  const batchUpdatePoints = (rule: ScoringRule) => {
    if (selectedStudentIds.length === 0) return;
    
    let firstLeveledUp: {name: string, level: number, pet: Pet} | null = null;
    const newLogs: Log[] = [];

    const updatedStudents = students.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        const newPoints = s.points + rule.points;
        
        // Calculate level up
        let tempLevel = s.level;
        let leveledUp = false;
        while (tempLevel < 7) {
            const currentLevelConfig = growthConfigs.find(c => c.level === tempLevel);
            if (currentLevelConfig && newPoints >= currentLevelConfig.pointsRequired) {
                tempLevel++;
                leveledUp = true;
            } else {
                break;
            }
        }

        if (leveledUp && !firstLeveledUp) {
            const pet = PETS.find(p => p.id === s.petId);
            if (pet) {
                firstLeveledUp = {
                    studentName: s.name,
                    level: tempLevel,
                    pet: pet
                } as any;
            }
        }

        const log: Log = {
          id: generateId() + '-' + s.id,
          studentId: s.id,
          studentName: s.name,
          ruleLabel: rule.label,
          points: rule.points,
          timestamp: new Date().toLocaleString(),
        };
        newLogs.push(log);
        return { ...s, points: newPoints, level: tempLevel };
      }
      return s;
    });

    setStudents(updatedStudents);
    setLogs(prev => [...newLogs, ...prev]);
    
    if (firstLeveledUp) {
        setTimeout(() => {
            setLevelUpInfo(firstLeveledUp as any);
        }, 300);
    }

    setSelectedStudentIds([]);
    setIsBatchMode(false);
    setIsScoringModalOpen(false);
  };

  const selectPet = (studentId: string, petId: string) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, petId } : s));
    setIsPetSelectModalOpen(false);
  };

  const exportData = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Students sheet
      const wsStudents = XLSX.utils.json_to_sheet(students.map(s => ({
        'ID': s.id,
        '姓名': s.name,
        '学号': s.studentNo || '',
        '当前积分': s.points,
        '当前等级': s.level,
        '班级ID': s.classId,
        '宠物ID': s.petId || '',
        '勋章数': s.medals || 0
      })));
      XLSX.utils.book_append_sheet(wb, wsStudents, "学生列表");

      // Classes sheet
      const wsClasses = XLSX.utils.json_to_sheet(classes.map(c => ({
        'ID': c.id,
        '班级名称': c.name
      })));
      XLSX.utils.book_append_sheet(wb, wsClasses, "班级列表");

      // Logs sheet
      const wsLogs = XLSX.utils.json_to_sheet(logs);
      XLSX.utils.book_append_sheet(wb, wsLogs, "评价记录");

      // Scoring Rules sheet
      const wsRules = XLSX.utils.json_to_sheet(scoringRules);
      XLSX.utils.book_append_sheet(wb, wsRules, "评价准则");

      XLSX.writeFile(wb, `云宠小镇_全量备份_${new Date().toLocaleDateString()}.xlsx`);
    } catch (err) {
      console.error('Export error:', err);
      alert('导出 Excel 失败，系统将导出 JSON 格式作为备选。');
      
      const data = {
          classes,
          students,
          logs,
          scoringRules,
          storeItems,
          growthConfigs
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `云宠小镇_备份_${new Date().toLocaleDateString()}.json`;
      a.click();
    }
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    // Check extension
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (workbook.Sheets["学生列表"]) {
            const studentsJson = XLSX.utils.sheet_to_json(workbook.Sheets["学生列表"]) as any[];
            setStudents(studentsJson.map(row => ({
              id: row.ID || generateId(),
              name: row['姓名'] || row.name || '未知',
              studentNo: row['学号'] || row.studentNo || '',
              points: Number(row['当前积分'] || row.points || 0),
              level: Number(row['当前等级'] || row.level || 1),
              classId: row['班级ID'] || row.classId,
              petId: row['宠物ID'] || row.petId || null,
              medals: Number(row['勋章数'] || row.medals || 0)
            })));
          }

          if (workbook.Sheets["班级列表"]) {
            const classesJson = XLSX.utils.sheet_to_json(workbook.Sheets["班级列表"]) as any[];
            setClasses(classesJson.map(row => ({
              id: row.ID || row.id || generateId(),
              name: row['班级名称'] || row.name
            })));
          }

          if (workbook.Sheets["评价记录"]) {
            setLogs(XLSX.utils.sheet_to_json(workbook.Sheets["评价记录"]));
          }

          if (workbook.Sheets["评价准则"]) {
            setScoringRules(XLSX.utils.sheet_to_json(workbook.Sheets["评价准则"]));
          }

          alert('Excel 数据导入成功！');
        } catch (err) {
          console.error('Excel Import Error:', err);
          alert('解析 Excel 失败，请确保使用系统导出的标准表格。');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Fallback for JSON
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.classes) setClasses(data.classes);
          if (data.students) setStudents(data.students);
          if (data.logs) setLogs(data.logs);
          if (data.scoringRules) setScoringRules(data.scoringRules);
        } catch (e) {
          console.error(e);
          alert('解析 JSON 失败');
        }
      };
      reader.readAsText(file);
    }
  };

  // --- 拦截授权界面渲染 ---
  if (!isAppAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* 背景 */}
        <div 
          className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url(${encodeURI("/pets/成长.jpg")})` }} 
        />
        <div className="fixed inset-0 -z-10 bg-white/20 backdrop-blur-xl" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass max-w-md w-full p-12 rounded-[50px] shadow-2xl border-4 border-white text-center space-y-8"
        >
          <div className="space-y-4">
            <div className="w-24 h-24 bg-white/60 rounded-[35px] flex items-center justify-center mx-auto shadow-inner border-2 border-white mb-6">
              <Lock size={48} className="text-rosy" />
            </div>
            <h1 className="text-4xl font-black text-gray-700 tracking-tighter">云宠小镇</h1>
            <p className="text-rosy font-bold">请通过授权码开启您的萌宠世界</p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="请输入授权卡密..."
                value={authKeyInput}
                onChange={(e) => {
                  setAuthKeyInput(e.target.value.toUpperCase());
                  setAuthError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (AUTHORIZED_KEYS.includes(authKeyInput.trim())) {
                      setIsAppAuthorized(true);
                      localStorage.setItem('clp_app_authorized', 'true');
                    } else {
                      setAuthError('卡密验证失败，请核对后重试 ✨');
                    }
                  }
                }}
                className={`w-full bg-white/50 border-2 ${authError ? 'border-red-400' : 'border-white'} px-6 py-5 rounded-3xl outline-none text-center font-black text-gray-700 placeholder:text-gray-300 focus:bg-white/80 transition-all shadow-sm`}
              />
              <AnimatePresence>
                {authError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-10 left-0 right-0 text-red-500 font-bold text-sm"
                  >
                    {authError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => {
                if (AUTHORIZED_KEYS.includes(authKeyInput.trim())) {
                  setIsAppAuthorized(true);
                  localStorage.setItem('clp_app_authorized', 'true');
                } else {
                  setAuthError('卡密验证失败，请核对后重试 ✨');
                }
              }}
              className="w-full bg-rosy text-white py-5 rounded-3xl font-black shadow-xl shadow-rosy/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
            >
              <span>立即解锁</span>
              <ChevronRight size={20} />
            </button>
          </div>

          <p className="text-xs text-gray-400 pt-4 font-medium opacity-60 leading-relaxed">
            * 每个卡密仅限单台设备生效<br/>
            授权状态将自动同步至本地持久化存储
          </p>
        </motion.div>
      </div>
    );
  }

  if (viewMode === 'login') {
    return (
      <div className="min-h-screen bg-[#FFF5F8] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
        {/* Playful Macaron Bubbles in Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-rosy-light rounded-full blur-[100px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-mint-light rounded-full blur-[120px] opacity-40" />
        <div className="absolute top-[20%] right-[-5%] w-[300px] h-[300px] bg-[#C7CEEA] rounded-full blur-[100px] opacity-30" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          className="bg-white/80 backdrop-blur-2xl max-w-5xl w-full rounded-[60px] shadow-[0_40px_80px_-15px_rgba(255,182,193,0.4)] flex flex-col md:flex-row overflow-hidden border-[12px] border-white relative z-10"
        >
          {/* Left Side: Playful Illustration Area */}
          <div className="w-full md:w-1/2 relative bg-[#FEF9F0] p-8 flex items-center justify-center min-h-[300px] md:min-h-0">
             <div className="w-full h-full rounded-[50px] overflow-hidden relative shadow-inner group">
                <img 
                    src={encodeURI("/pets/成长.jpg")} 
                    alt="Cute Pets" 
                    className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?auto=format&fit=crop&q=80&w=1000")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rosy/50 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 text-white z-20">
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                      className="bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl py-1.5 px-3 sm:py-2 sm:px-5 inline-flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-5 border border-white/30"
                    >
                      <Sparkles size={14} className="sm:size-18 text-yellow-200 animate-spin-slow" />
                      <span className="font-black text-[9px] sm:text-xs tracking-[0.2em] sm:tracking-widest opacity-90">CLOUD PET TOWN</span>
                    </motion.div>
                    <motion.h4 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-4xl sm:text-6xl font-black mb-2 sm:mb-3 tracking-tighter drop-shadow-lg">云宠小镇</motion.h4>
                    <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="font-black text-white/90 text-sm sm:text-xl tracking-wide">在这里遇见你的第一位萌宠伙伴 ✨</motion.p>
                </div>
             </div>
          </div>

          {/* Right Side: Fun Button Area */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-20 flex flex-col justify-center bg-white/40">
              <div className="flex flex-col items-center space-y-8 sm:space-y-12">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-24 h-24 sm:w-32 sm:h-32 bg-rosy rounded-[35px] sm:rounded-[45px] flex items-center justify-center shadow-[0_25px_50px_rgba(241,101,137,0.35)] relative overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-white/20 -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <PawPrint size={48} sm:size={72} className="text-white relative z-10" strokeWidth={3} />
                  </motion.div>

                  <div className="text-center space-y-3 sm:space-y-4">
                    <h2 className="text-3xl sm:text-5xl font-black text-[#2D4256] tracking-tight">你好呀！小主人</h2>
                    <span className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-rosy-light text-rosy rounded-full font-black text-[10px] sm:text-sm tracking-[0.2em] border-2 sm:border-4 border-white shadow-sm uppercase">
                      班级云养宠乐园
                    </span>
                  </div>

                  <div className="w-full space-y-6 sm:space-y-8 pt-2 sm:pt-4">
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('teacher')}
                      className="w-full py-5 sm:py-8 rounded-[30px] sm:rounded-[40px] font-black text-xl sm:text-3xl bg-rosy text-white shadow-[0_20px_50px_-15px_rgba(241,101,137,0.4)] hover:shadow-[0_25px_60px_-10px_rgba(241,101,137,0.5)] transition-all flex items-center justify-center space-x-3 sm:space-x-4 group border-b-[6px] sm:border-b-[8px] border-rosy-dark active:border-b-0 active:translate-y-2"
                    >
                      <GraduationCap size={28} sm:size={36} />
                      <span>开启奇幻之旅</span>
                      <ChevronRight size={24} sm:size={32} className="group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                    
                    <div className="flex justify-center items-center space-x-3 sm:space-x-4 text-[#D1D5DB] opacity-60">
                      <div className="w-8 sm:w-12 h-1 sm:h-1.5 bg-current rounded-full" />
                      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em]">START GAME</span>
                      <div className="w-8 sm:w-12 h-1 sm:h-1.5 bg-current rounded-full" />
                    </div>
                  </div>
              </div>
          </div>
        </motion.div>
        
        {/* Floating Clouds Decoration */}
        <div className="fixed bottom-6 sm:bottom-12 text-[#E5E9F0] text-[10px] sm:text-[14px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] pointer-events-none select-none text-center w-full px-4">
           ʕ•ᴥ•ʔ  CLOUD PET ADVENTURE  ʕ•ᴥ•ʔ
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#2D4256] overflow-x-hidden relative font-sans pb-20 sm:pb-32">
      {/* 全屏“成长”主题背景图片 */}
      <div 
        className="fixed inset-0 -z-20 bg-cover bg-top bg-no-repeat" 
        style={{ 
          backgroundImage: `url(${encodeURI("/pets/成长.jpg")})`,
        }} 
      />
      {/* 柔化遮罩层 - 调整为 15% 不透明度并保留微弱模糊以确保内容清晰 */}
      <div className="fixed inset-0 -z-10 bg-white/15 backdrop-blur-[1px] pointer-events-none" />

      {/* 治愈系马卡龙背景光晕 */}
      <div className="fixed top-[-10%] left-[-10%] w-[400px] h-[400px] bg-rosy-light/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#C7CEEA]/30 blur-[150px] rounded-full pointer-events-none" />
      
      {/* 顶部标题栏 */}
      <header className="bg-white/80 backdrop-blur-xl border-b-[4px] sm:border-b-[6px] border-[#F1F5F9] sticky top-0 z-50 px-2 py-1.5 sm:px-10 sm:py-2.5 h-auto">
        <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-start lg:space-x-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-9 h-9 sm:w-14 sm:h-14 bg-rosy rounded-[16px] sm:rounded-[24px] flex items-center justify-center shadow-lg shadow-rosy-light flex-shrink-0 overflow-hidden ring-[3px] sm:ring-[5px] ring-rosy-light/30"
              >
                <img 
                  src={encodeURI("/pets/成长.jpg")} 
                  alt="Mythical Beast" 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "https://api.dicebear.com/7.x/bottts/svg?seed=rainbow")}
                />
              </motion.div>
              <div className="flex flex-col">
                <h1 className="text-base md:text-xl lg:text-2xl font-black text-rosy leading-tight mb-0 sm:mb-0.5">云宠小镇</h1>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="hidden sm:block text-[7px] md:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] text-rosy font-black uppercase hover:opacity-80 transition-opacity text-left opacity-80"
                >CLOUD PET TOWN</button>
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
               {/* 班级切换下拉框 - 移动端适配 */}
               <div className="flex items-center bg-[#F8FAFC] border-[2px] sm:border-[3px] border-[#F1F5F9] rounded-[14px] sm:rounded-[22px] overflow-hidden">
                  <div className="pl-2 sm:pl-5 text-[#CBD5E1]">
                    <Users size={12} className="sm:size-[14px]" />
                  </div>
                  <select 
                    value={currentClassId}
                    onChange={(e) => setCurrentClassId(e.target.value)}
                    className="bg-transparent pl-1.5 pr-5 sm:pr-8 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-black text-[#2D4256] appearance-none cursor-pointer outline-none max-w-[80px] sm:max-w-none"
                  >
                    <option value="">小镇列表</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="pr-2 text-[#CBD5E1] hidden sm:block">
                    <ChevronDown size={14} />
                  </div>
               </div>

               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setIsClassModalOpen(true)}
                 className="w-7 h-7 sm:w-10 sm:h-10 bg-white border-[2px] sm:border-[3px] border-[#F1F5F9] rounded-[10px] sm:rounded-[18px] flex items-center justify-center text-[#94A3B8] hover:text-rosy hover:border-rosy/30 transition-all shadow-sm flex-shrink-0"
                 title="新建小镇"
               >
                 <Plus size={14} sm:size={16} strokeWidth={3} />
               </motion.button>
            </div>
          </div>

          <div className="w-full lg:w-auto flex items-center space-between lg:justify-end space-x-1 sm:space-x-2 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar scrollbar-hide">
            <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 flex-nowrap">
              {[
                { id: 'home', label: '主页', icon: LayoutDashboard, active: activeTab === 'home' },
                { id: 'rankings', label: '星光荣誉榜', icon: Trophy, active: activeTab === 'rankings' },
                { id: 'store', label: '萌宠小店', icon: ShoppingBag, active: activeTab === 'store' },
                { id: 'records', label: '成长日记', icon: History, active: activeTab === 'records' },
                { id: 'settings', label: '设置', icon: Settings2, active: activeTab === 'settings', onClick: () => {
                  setActiveTab('settings');
                  setSettingsSubTab('help');
                }}
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = item.active;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick || (() => setActiveTab(item.id as any))}
                      className={`flex items-center space-x-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2.5 rounded-[12px] sm:rounded-[18px] transition-all whitespace-nowrap text-nav-clamp font-black border-2 flex-shrink-0 ${isActive ? 'bg-[#FFF5E6] text-rosy border-rosy/30 shadow-md shadow-orange-100/30' : 'bg-transparent text-rosy border-transparent hover:bg-white/50'}`}
                    >
                      <Icon size={12} className="sm:size-4 md:size-[18px] flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

               <div className="h-5 w-[2px] bg-[#F1F5F9] mx-0.5 sm:mx-2 flex-shrink-0" />

               {/* 顶部排序功能 */}
               <div className="flex items-center bg-[#F8FAFC] border-[2px] sm:border-[3px] border-[#F1F5F9] rounded-[14px] sm:rounded-[22px] overflow-hidden px-2 sm:px-4 flex-shrink-0">
                  <span className="hidden xl:inline text-[9px] lg:text-[10px] font-black text-[#94A3B8] mr-2 uppercase">排序</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent py-1 sm:py-2.5 text-[9px] sm:text-xs md:text-sm font-black text-[#2D4256] outline-none cursor-pointer"
                  >
                    <option value="name">姓名</option>
                    <option value="no">学号</option>
                    <option value="points">积分</option>
                    <option value="level">等级</option>
                    <option value="surname">姓氏</option>
                  </select>
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-4 py-8 sm:px-10">
        {!currentClassId && activeTab !== 'settings' ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] relative pt-10 sm:pt-20">
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full max-w-4xl aspect-[1.5/1] sm:aspect-[2/1] rounded-[30px] sm:rounded-[60px] overflow-hidden shadow-2xl border-[6px] sm:border-[12px] border-white relative group"
             >
                <img 
                  src={encodeURI("/pets/成长.jpg")} 
                  alt="Rainbow Pet" 
                  className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                  onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?auto=format&fit=crop&q=80&w=1200")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rosy/40 via-transparent to-white/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-10">
                   <motion.div 
                     animate={{ y: [0, -20, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     className="w-20 h-20 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-md rounded-full border-2 sm:border-4 border-white/40 flex items-center justify-center shadow-2xl mb-4 sm:mb-8"
                   >
                     <Sparkles size={40} sm:size={64} className="text-yellow-200" strokeWidth={1} />
                   </motion.div>
                   <h2 className="text-3xl sm:text-6xl font-black text-white drop-shadow-2xl mb-4 sm:mb-6 tracking-tighter">你还没建立专属小镇哦</h2>
                   <p className="text-base sm:text-2xl font-bold text-white/95 mb-6 sm:mb-10 drop-shadow-lg text-center font-display">让每一位宝贝都有属于自己的萌宠伙伴 ✨</p>
                   
                   <motion.button 
                     whileHover={{ scale: 1.05, rotate: -1 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => setIsClassModalOpen(true)}
                     className="px-6 sm:px-16 py-3 sm:py-7 rounded-[22px] sm:rounded-[40px] bg-white text-rosy font-black text-base sm:text-4xl shadow-2xl hover:bg-rosy-light transition-all flex items-center space-x-2 sm:space-x-4 border-b-[4px] sm:border-b-[8px] border-[#EEE] active:border-b-0 active:translate-y-2 shrink-0"
                   >
                      <PlusCircle size={20} sm:size={40} />
                      <span>创建专属班级</span>
                   </motion.button>
                </div>
             </motion.div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Home Content Area */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
                   <div className="flex items-center space-x-6">
                      <div>
                         <p className="text-lg sm:text-xl font-black text-rosy leading-relaxed">看看大家的小伙伴成长得怎么样了 ✨</p>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative group w-full sm:w-64 lg:w-80">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#CBD5E1]" size={18} />
                        <input 
                          type="text"
                          placeholder="搜索学生..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white border-[3px] border-[#F1F5F9] rounded-[22px] pl-16 pr-6 py-3 text-sm font-bold outline-none focus:border-rosy/30 transition-all shadow-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsStudentModalOpen(true)}
                          className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-mint-light text-mint-dark border-2 border-mint-border rounded-[22px] font-black text-xs sm:text-sm transition-all hover:bg-mint/10 shadow-sm"
                        >
                           <PlusCircle size={16} sm:size={18} />
                           <span>添加伙伴</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                             if (isBatchMode && batchType === 'evaluate') {
                               setIsBatchMode(false);
                               setBatchType(null);
                             } else {
                               setIsBatchMode(true);
                               setBatchType('evaluate');
                               setSelectedStudentIds([]);
                             }
                          }}
                          className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-8 py-3 rounded-[22px] font-black text-xs sm:text-sm transition-all shadow-lg ${isBatchMode && batchType === 'evaluate' ? 'bg-[#475569] text-white' : 'bg-rosy text-white hover:bg-rosy-dark shadow-rosy-light border-2 border-transparent'}`}
                        >
                           <Sparkles size={16} sm:size={18} />
                           <span>批量评价</span>
                        </motion.button>
                      </div>
                   </div>
                </div>

                {/* Batch Mode Bar */}
                <AnimatePresence>
                  {isBatchMode && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 sm:p-5 bg-white/90 backdrop-blur-md border-[4px] border-rosy/10 shadow-xl rounded-[25px] sm:rounded-[35px] flex flex-col sm:flex-row items-center justify-between mx-4 gap-4"
                    >
                        <div className="flex items-center space-x-4 sm:space-x-5 pl-0 sm:pl-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rosy-light rounded-[14px] sm:rounded-[18px] flex items-center justify-center text-rosy flex-shrink-0">
                               <Sparkles size={20} sm:size={24} strokeWidth={3} />
                            </div>
                            <div>
                               <p className="text-base sm:text-lg font-black text-[#2D4256]">批量评分模式</p>
                              <p className="text-xs sm:text-sm font-bold text-rosy">已选中 {selectedStudentIds.length} 名小伙伴</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 pr-0 sm:pr-2 w-full sm:w-auto">
                              <button onClick={() => {
                                setIsBatchMode(false);
                                setSelectedStudentIds([]);
                              }} className="flex-1 sm:flex-none px-6 py-2.5 text-[#94A3B8] font-bold text-sm">取消</button>
                              <button 
                                 onClick={() => {
                                   if (selectedStudentIds.length === 0) return alert('请先选择学生！');
                                   setIsScoringModalOpen(true);
                                 }}
                                 className="flex-1 sm:flex-none bg-mint text-white px-8 py-2.5 rounded-full font-black shadow-lg shadow-mint-light text-sm"
                              >确认批量评分</button>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Student Card Stream */}
                <div 
                  className="bg-white/15 backdrop-blur-sm rounded-[30px] sm:rounded-[50px] p-4 sm:p-8 min-h-[60vh] border-[4px] sm:border-[8px] border-white/50 relative"
                  style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/grid-me.png")' }}
                >
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                    {visibleStudents.map((student) => {
                      const pet = PETS.find(p => p.id === student.petId);
                      const petIndex = pet ? PETS.findIndex(p => p.id === pet.id) : -1;
                      const bgColorClass = petIndex !== -1 ? MACARON_COLORS[petIndex % MACARON_COLORS.length] : 'bg-[#FFF9DB]';
                      const isSelected = selectedStudentIds.includes(student.id);
                      return (
                        <motion.div
                          layout
                          key={student.id}
                          whileHover={{ y: -8, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (isBatchMode) {
                              if (isSelected) {
                                  setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                              } else {
                                  setSelectedStudentIds([...selectedStudentIds, student.id]);
                              }
                              return;
                            }
                          setSelectedStudent(student);
                          setIsScoringModalOpen(true);
                        }}
                        className={`${bgColorClass} px-3 pt-3 pb-5 rounded-[28px] sm:rounded-[35px] shadow-sm border-[3px] sm:border-[4px] relative group transition-all cursor-pointer overflow-hidden flex flex-col items-center text-center max-w-full sm:max-w-[200px] mx-auto w-full ${isSelected ? 'border-[#3B82F6] ring-[8px] sm:ring-[12px] ring-[#3B82F6]/5' : 'border-white hover:shadow-2xl hover:border-[#EFF6FF]'}`}
                      >
                         {/* Pet Visualization */}
                        <div 
                          onClick={(e) => {
                            if (!isBatchMode) {
                              e.stopPropagation();
                              setSelectedStudent(student);
                              setIsScoringModalOpen(true);
                            }
                          }}
                          className="w-[85%] aspect-square rounded-[25px] sm:rounded-[30px] mt-0 mb-3 flex items-center justify-center p-0 relative transition-all overflow-hidden hover:ring-6 hover:ring-[#3B82F6]/20 cursor-pointer shadow-inner bg-white/80 backdrop-blur-sm border-2 border-white/50"
                        >
                          {pet ? (
                            <PetDisplay pet={pet} level={student.level} fill={true} />
                          ) : (
                            <img 
                              src={encodeURI("/pets/宠物蛋.jpg")} 
                              alt="宠物蛋"
                              className="w-full h-full object-cover opacity-90"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.endsWith('.jpg')) {
                                  target.src = encodeURI('/pets/宠物蛋.png');
                                } else {
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'text-5xl opacity-40 animate-pulse';
                                    fallback.innerText = '🥚';
                                    parent.appendChild(fallback);
                                  }
                                }
                              }}
                            />
                          )}
                            
                            {/* Hover Actions */}
                            {!isBatchMode && (
                               <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setStudentToDelete(student);
                                    }}
                                    className="bg-white/95 backdrop-blur-md text-red-500 p-2 rounded-full shadow-xl border border-red-100 hover:bg-red-500 hover:text-white hover:scale-125 hover:rotate-12 transition-all active:scale-95"
                                    title="删除学生"
                                  >
                                     <Trash2 size={18} strokeWidth={2.5} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedStudent(student);
                                      setIsPetSelectModalOpen(true);
                                    }}
                               className="bg-white/95 backdrop-blur-md text-rosy p-2 rounded-full shadow-xl border border-rosy-light hover:bg-rosy hover:text-white hover:scale-125 hover:-rotate-12 transition-all active:scale-95"
                                    title="更换宠物"
                                  >
                                     <RotateCcw size={18} strokeWidth={2.5} />
                                  </button>
                               </div>
                             )}

                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm shadow-md border border-white/50 px-3 py-1 rounded-full text-[10px] font-black text-rosy z-30 flex items-center space-x-1 group-hover:opacity-0 transition-opacity">
                               <span>LV.</span>
                               <span className="text-sm">{student.level}</span>
                            </div>
                          </div>

                          <div className="w-full px-2 mb-3 mt-1">
                             <div className="flex items-center justify-center space-x-1.5 flex-wrap">
                               <h4 className="text-xl font-black text-[#2D4256] leading-tight truncate">{student.name}</h4>
                               <span className="text-[8px] font-black text-gray-400/60 uppercase tracking-tighter">#{student.studentNo || '000'}</span>
                             </div>
                          </div>

                          {/* Stats */}
                          <div className="space-y-4 px-1 w-full">
                            {(() => {
                              const prog = getLevelProgress(student.points, growthConfigs);
                              return (
                                <div className="space-y-3 pt-2 border-t border-black/5">
                                  <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                                      <motion.div 
                                        className="h-full bg-gradient-to-r from-rosy to-rosy-dark rounded-full shadow-[0_0_10px_rgba(241,101,137,0.3)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((prog.currentLevelPoints / (prog.nextLevelPoints || 1)) * 100, 100)}%` }}
                                      />
                                  </div>
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-gray-500 font-black tracking-tight">成长值</span>
                                    <span className="font-black text-rosy tabular-nums">
                                        {prog.currentLevelPoints} / {prog.nextLevelPoints || 'MAX'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Batch Checkbox */}
                          {isBatchMode && (
                            <div className={`absolute top-6 left-6 w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all shadow-md ${isSelected ? 'bg-rosy border-rosy' : 'bg-white border-[#E2E8F0]'}`}>
                              {isSelected && <Check size={18} className="text-white" strokeWidth={4} />}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

          {/* Other Tabs content remains mostly same but with updated container styles */}

          {activeTab === 'inventory' && (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-gray-800 flex items-center space-x-3">
                    <Baby className="text-rosy" />
                    <span>我的成长背包</span>
                </h2>
                <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-100 italic">
                    共收藏 {inventory.length} 件宝物
                </div>
              </div>

              {inventory.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center space-y-4 border border-gray-100 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-4 grayscale opacity-50">
                        🎁
                    </div>
                    <p className="text-xl font-bold text-gray-400">背包里空空如也...</p>
                    <p className="text-sm text-gray-400 px-10">通关第 3 关后开启盲盒即可获得各种稀有奖励！</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {inventory.map((item, idx) => {
                        const rarityInfo = RARITY_CONFIG[item.rarity];
                        return (
                            <motion.div 
                                key={`${item.id}-${idx}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase ${rarityInfo.bgColor} ${rarityInfo.color}`}>
                                    {rarityInfo.name}
                                </div>
                                <div className="flex justify-center mb-4">
                                    <img 
                                        src={item.imageUrl} 
                                        className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-500" 
                                        alt={item.name}
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <h3 className="text-lg font-black text-gray-800 text-center mb-1">{item.name}</h3>
                                <p className="text-xs text-center text-gray-400 mb-3 px-2 line-clamp-2">{item.description}</p>
                                <div className="text-[9px] text-center text-gray-300 font-bold">
                                    获得于: {item.obtainedAt}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'rankings' && (
            <motion.div 
               key="rankings"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass rounded-[40px] p-10 max-w-2xl mx-auto"
            >
                <div className="flex items-center space-x-4 mb-10">
                    <div className="p-4 bg-yellow-300 rounded-3xl text-white shadow-lg shadow-yellow-100">
                        <Trophy size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-700 tracking-tight">星光璀璨 · 光荣榜</h2>
                        <p className="text-sm font-bold text-gray-400">看看哪位小可爱最努力呢？</p>
                    </div>
                </div>

                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.05 } }
                    }}
                    className="space-y-3"
                >
                    {students.sort((a, b) => b.points - a.points).map((s, idx) => {
                        const pet = PETS.find(p => p.id === s.petId);
                        
                        const getRankStyles = (i: number) => {
                            if (i === 0) return {
                                container: 'border-yellow-200 bg-gradient-to-r from-white to-yellow-50/30 shadow-md',
                                rank: 'text-yellow-500 scale-110 drop-shadow-[0_2px_4px_rgba(234,179,8,0.2)]',
                                badge: 'Champion',
                                badgeColor: 'bg-yellow-400'
                            };
                            if (i === 1) return {
                                container: 'border-slate-200 bg-gradient-to-r from-white to-slate-50/30 shadow-sm',
                                rank: 'text-slate-400',
                                badge: 'Silver',
                                badgeColor: 'bg-slate-300'
                            };
                            if (i === 2) return {
                                container: 'border-orange-200 bg-gradient-to-r from-white to-orange-50/30 shadow-sm',
                                rank: 'text-orange-400',
                                badge: 'Bronze',
                                badgeColor: 'bg-orange-300'
                            };
                            return {
                                container: 'border-transparent bg-white shadow-sm',
                                rank: 'text-gray-300 opacity-60 text-xl',
                                badge: null,
                                badgeColor: ''
                            };
                        };

                        const styles = getRankStyles(idx);

                        return (
                            <motion.div 
                                key={s.id} 
                                variants={{
                                    hidden: { opacity: 0, y: 10 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className={`flex items-center p-3 sm:p-4 rounded-[28px] border-2 transition-all relative overflow-hidden group hover:scale-[1.01] ${styles.container}`}
                            >
                                {styles.badge && (
                                    <div className={`absolute top-0 right-0 ${styles.badgeColor} text-white px-4 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest z-10`}>
                                        {styles.badge}
                                    </div>
                                )}
                                
                                <div className={`w-12 h-12 flex items-center justify-center font-black text-2xl italic mr-4 transition-all ${styles.rank}`}>
                                    {idx + 1}
                                </div>

                                <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden mr-4 border border-gray-100 shadow-sm flex items-center justify-center relative">
                                    {pet ? (
                                        <PetDisplay pet={pet} level={s.level} fill={true} />
                                    ) : (
                                        <img 
                                            src={encodeURI("/pets/宠物蛋.jpg")} 
                                            alt="宠物蛋"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = encodeURI('/pets/宠物蛋.png');
                                            }}
                                        />
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="font-black text-lg text-[#2D4256] leading-none">{s.name}</h4>
                                        <div className="flex items-center space-x-2 bg-rosy-light px-2.5 py-0.5 rounded-full border border-rosy-border">
                                            <span className="text-[11px] font-black text-rosy uppercase tracking-wider">{pet?.name || '神秘伙伴'}</span>
                                            <div className="w-1 h-1 bg-rosy-border rounded-full" />
                                            <span className="text-[11px] font-black text-rosy-dark">LV.{s.level}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex items-center space-x-3 px-4">
                                    <div className="flex flex-col items-end">
                                        <div className="text-xl font-black text-rosy tabular-nums leading-none">{s.points}</div>
                                        <div className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">荣誉积分</div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                    {students.length === 0 && (
                        <div className="py-12 text-center opacity-40">
                             <Trophy size={48} className="mx-auto mb-4" />
                             <p className="font-bold">尚无勇者上榜</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
          )}

          {activeTab === 'store' && (
             <motion.div 
                key="store"
                className="space-y-8"
             >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-4 bg-rosy rounded-3xl text-white shadow-lg shadow-rosy-light">
                            <Store size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-700 tracking-tight">爱心百宝箱 <span className="text-xs bg-rosy-light text-rosy px-3 py-1 rounded-full ml-3 font-bold">GIFT STORE</span></h2>
                             <p className="text-sm font-bold text-rosy">用辛勤的汗水换取丰厚的奖章吧！</p>
                        </div>
                    </div>
                    {viewMode === 'teacher' && (
                        <button 
                            onClick={() => {
                                setEditingStoreItem(null);
                                setIsStoreModalOpen(true);
                            }}
                            className="bg-rosy text-white px-6 py-2.5 rounded-2xl font-black text-sm shadow-xl hover:bg-rosy-dark transition-all flex items-center space-x-2"
                        >
                            <Plus size={18} />
                            <span>添加新卡片</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {storeItems.map(item => (
                        <div key={item.id} className="glass p-8 rounded-[40px] relative group hover:bg-white/60 transition-all flex flex-col">
                            {/* Stock Display & Quick Adjust (Teacher Only) */}
                            <div className="absolute top-6 right-6 flex items-center bg-rosy-light text-rosy px-3 py-1.5 rounded-full text-xs font-black shadow-sm border border-white/50">
                                <span>库存: {item.stock}</span>
                                {viewMode === 'teacher' && (
                                    <div className="flex items-center ml-2 space-x-1 border-l border-rosy/20 pl-2">
                                        <button 
                                            onClick={() => updateStoreItem(item.id, { stock: Math.max(0, item.stock - 1) })}
                                            className="hover:scale-125 transition-transform active:scale-95"
                                        >
                                            <Minus size={12} strokeWidth={4} />
                                        </button>
                                        <button 
                                            onClick={() => updateStoreItem(item.id, { stock: item.stock + 1 })}
                                            className="hover:scale-125 transition-transform active:scale-95"
                                        >
                                            <Plus size={12} strokeWidth={4} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                             {viewMode === 'teacher' && (
                                <div className="absolute top-6 left-6 flex space-x-2">
                                    <button 
                                        onClick={() => {
                                            setEditingStoreItem(item);
                                            setIsStoreModalOpen(true);
                                        }}
                                        className="p-2.5 bg-white shadow-md text-rosy rounded-2xl hover:bg-rosy hover:text-white transition-all transform hover:-rotate-12 border-2 border-white"
                                        title="修改内容"
                                    >
                                        <Pencil size={16} strokeWidth={2.5} />
                                    </button>
                                    <button 
                                        onClick={() => deleteStoreItem(item.id)}
                                        className="p-2.5 bg-white shadow-md text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all transform hover:rotate-12 border-2 border-white"
                                        title="下架商品"
                                    >
                                        <Trash2 size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}

                            <div className="w-24 h-24 bg-white rounded-[35px] mx-auto mb-6 flex items-center justify-center text-rosy shadow-lg border-4 border-white transform group-hover:rotate-6 transition-transform">
                                {item.icon === 'Cookie' ? <Cookie size={48} /> : 
                                 item.icon === 'FileText' ? <FileText size={48} /> :
                                 item.icon === 'FileX' ? <FileX size={48} /> :
                                 item.icon === 'Scissors' ? <Scissors size={48} /> :
                                 item.icon === 'Monitor' ? <Monitor size={48} /> :
                                 item.icon === 'Users' ? <Users size={48} /> :
                                 item.icon === 'Trophy' ? <Trophy size={48} /> :
                                 item.icon === 'Gift' ? <ShoppingBag size={48} /> :
                                 <Sparkles size={48} />}
                            </div>
                            <div className="text-center space-y-4 flex-1 flex flex-col">
                                <h3 className="text-xl font-black text-gray-700">{item.name}</h3>
                                <p className="text-sm font-bold text-gray-400 px-4 flex-1">{item.description}</p>
                                <div className="flex items-center justify-center space-x-1 text-yellow-500">
                                    <Star size={16} fill="currentColor" />
                                    <span className="font-black text-2xl">{item.price}</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedItemToRedeem(item);
                                        setIsRedeemModalOpen(true);
                                    }}
                                    className="w-full bg-rosy text-white py-4 rounded-[30px] font-black shadow-lg shadow-rosy-light hover:bg-rosy-dark hover:scale-[1.03] transition-all"
                                >
                                    立即兑换
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             </motion.div>
          )}

          {activeTab === 'records' && (
            <motion.div key="records" className="glass rounded-[40px] p-10 overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-4">
                        <History size={32} className="text-rosy" />
                        <h2 className="text-2xl font-black text-gray-700">光阴印记 · 评价记录</h2>
                    </div>
                    <button className="flex items-center space-x-2 text-sm text-rosy font-bold bg-white/60 border border-white/80 px-6 py-2.5 rounded-2xl hover:bg-white transition-all shadow-sm">
                          <Download size={18} />
                          <span>导出报告</span>
                      </button>
                </div>
                <div className="space-y-4 pr-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {visibleLogs.length === 0 ? (
                        <div className="py-20 text-center opacity-40">
                            <History size={48} className="mx-auto mb-4" />
                            <p className="font-bold">暂无足迹记录</p>
                        </div>
                    ) : (
                      visibleLogs.map(log => (
                          <div key={log.id} className="flex items-center justify-between p-6 bg-white/40 border border-white/60 rounded-[35px] hover:bg-white/80 transition-all group">
                              <div className="flex items-center space-x-6">
                                  <div className="w-12 h-12 rounded-[20px] bg-white border border-white/80 text-rosy flex items-center justify-center font-black text-xl shadow-sm group-hover:bg-rosy group-hover:text-white transition-all">
                                      {log.studentName.charAt(0)}
                                  </div>
                                  <div>
                                      <h5 className="font-bold text-gray-700 text-lg">{log.studentName} <span className="mx-3 text-gray-200 font-light">|</span> <span className="text-xs text-gray-400 font-bold">{log.timestamp}</span></h5>
                                      <p className="text-sm text-gray-500 font-bold mt-0.5">{log.ruleLabel}</p>
                                  </div>
                              </div>
                              <div className={`text-xl font-black tabular-nums ${log.points > 0 ? 'text-mint-dark' : 'text-red-400'}`}>
                                  {log.points > 0 ? `+${log.points}` : log.points}
                              </div>
                          </div>
                      ))
                    )}
                </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" className="space-y-8 max-w-5xl mx-auto pb-20">
                <div className="glass rounded-[40px] overflow-hidden border-4 border-white shadow-2xl">
                    <div className="p-8 border-b border-white/40 bg-white/40 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Settings2 className="text-rosy" />
                            <h3 className="font-black text-[#555555] text-2xl font-sans relative py-1">
                                设置与帮助
                                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-rosy-light rounded-full -z-10" />
                            </h3>
                        </div>
                        <button 
                            onClick={() => setActiveTab('home')}
                            className="p-2 bg-white/60 hover:bg-white rounded-full transition-all"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="flex border-b border-white/20 bg-white/20">
                        {[
                            { id: 'rules', label: '加减分规则', icon: FileText },
                            { id: 'growth', label: '成长设置', icon: Sparkles },
                            { id: 'data', label: '数据管理', icon: Download },
                            { id: 'help', label: '软件与帮助', icon: Users },
                        ].map((sub) => (
                            <button
                                key={sub.id}
                                onClick={() => setSettingsSubTab(sub.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 py-4 font-black transition-all border-b-4 ${settingsSubTab === sub.id ? 'border-orange-500 text-orange-500 bg-white/40' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <sub.icon size={18} />
                                <span className="text-sm">{sub.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-10 bg-[#FFFDF0]/50">
                        <AnimatePresence mode="wait">
                            {settingsSubTab === 'rules' && (
                                <motion.div 
                                    key="rule-settings" 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex h-[600px] -m-10 bg-[#F4F7FA]"
                                >
                                    {/* Sidebar */}
                                    <div className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 space-y-8">
                                        <button 
                                            onClick={() => {
                                                setEditingRuleData(null);
                                                setIsRuleModalOpen(true);
                                            }}
                                            className="w-full bg-rosy text-white py-3 rounded-xl font-black text-lg shadow-lg shadow-rosy-light hover:bg-rosy-dark transition-all flex items-center justify-center space-x-2"
                                        >
                                            <Plus size={20} strokeWidth={3} />
                                            <span>新增指标</span>
                                        </button>

                                        <div className="space-y-6">
                                            <h5 className="text-xs font-black text-[#888888] uppercase tracking-[0.2em] pl-2">分类目录</h5>
                                            <div className="space-y-1">
                                                {[
                                                    { id: 'study', label: '学习', count: scoringRules.filter(r => r.category === 'study').length, color: 'text-rosy', bg: 'bg-rosy-light' },
                                                    { id: 'behavior', label: '行为', count: scoringRules.filter(r => r.category === 'behavior').length, color: 'text-gray-600', bg: 'bg-gray-50' },
                                                    { id: 'health', label: '健康', count: scoringRules.filter(r => r.category === 'health').length, color: 'text-mint-dark', bg: 'bg-mint-light' },
                                                    { id: 'other', label: '其他', count: scoringRules.filter(r => r.category === 'other' || r.category === 'kindergarten').length, color: 'text-orange-500', bg: 'bg-orange-50' },
                                                ].map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setRuleCategoryFilter(cat.id)}
                                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-black transition-all ${ruleCategoryFilter === cat.id ? `${cat.bg} ${cat.color}` : 'text-gray-400 hover:bg-gray-50'}`}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${ruleCategoryFilter === cat.id ? 'bg-current' : 'bg-gray-200'}`} />
                                                            <span>{cat.label}</span>
                                                        </div>
                                                        <span className="text-xs opacity-60">{cat.count}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-4 border-t border-gray-50 pt-6">
                                            <h5 className="text-xs font-black text-[#888888] uppercase tracking-[0.2em] pl-2">规则总计</h5>
                                            <div className="space-y-2 pl-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-mint-dark font-bold">加分 {scoringRules.filter(r => r.type === 'plus').length} 条</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-red-400 font-bold">减分 {scoringRules.filter(r => r.type === 'minus').length} 条</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 flex flex-col min-w-0">
                                        <div className="p-8 pb-4">
                                            <div className="flex items-center space-x-3 text-gray-700">
                                                <div className="w-1.5 h-6 bg-rosy rounded-full" />
                                                <h4 className="text-xl font-black text-[#555555] font-sans relative py-1 inline-block">
                                                    {ruleCategoryFilter === 'study' ? '学习' : ruleCategoryFilter === 'behavior' ? '行为' : ruleCategoryFilter === 'health' ? '健康' : '其他'}
                                                    类指标
                                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-rosy-light rounded-full -z-10" />
                                                    <span className="ml-4 text-xs font-bold text-[#888888]">
                                                        奖 {scoringRules.filter(r => r.category === ruleCategoryFilter && r.type === 'plus').length} 
                                                        惩 {scoringRules.filter(r => r.category === ruleCategoryFilter && r.type === 'minus').length}
                                                    </span>
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-4 custom-scrollbar">
                                            {scoringRules
                                                .filter(r => {
                                                    if (ruleCategoryFilter === 'other') return r.category === 'other' || r.category === 'kindergarten';
                                                    return r.category === ruleCategoryFilter;
                                                })
                                                .sort((a, b) => {
                                                    // Sort by type (plus first) then by points
                                                    if (a.type !== b.type) return a.type === 'plus' ? -1 : 1;
                                                    return b.points - a.points;
                                                })
                                                .map(rule => (
                                                <div key={rule.id} className="bg-white rounded-[24px] p-4 shadow-sm border border-white hover:shadow-md transition-all group flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${rule.type === 'plus' ? 'bg-mint-light text-mint-dark' : 'bg-red-50 text-red-500'}`}>
                                                            {rule.icon === 'Sparkles' ? <Sparkles size={24} /> : 
                                                             rule.icon === 'Book' ? <Book size={24} /> :
                                                             rule.icon === 'Users' ? <Users size={24} /> :
                                                             rule.icon === 'Heart' ? <Heart size={24} /> :
                                                             rule.icon === 'Clock' ? <Clock size={24} /> :
                                                             rule.type === 'minus' ? <Zap size={24} /> :
                                                             <Sparkles size={24} />}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <h5 className="font-black text-[#555555] truncate text-lg leading-tight">{rule.label}</h5>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="bg-rosy-light text-rosy px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">全部班级</span>
                                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                                    <button 
                                                                        onClick={() => {
                                                                            setEditingRuleData(rule);
                                                                            setIsRuleModalOpen(true);
                                                                        }}
                                                                        className="p-1 text-gray-300 hover:text-rosy transition-all"
                                                                    >
                                                                        <Pencil size={14} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => removeScoringRule(rule.id)}
                                                                        className="p-1 text-gray-300 hover:text-red-500 transition-all"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4 shrink-0">
                                                        <div className={`flex items-center space-x-3 ${rule.type === 'plus' ? 'text-mint-dark' : 'text-red-500'}`}>
                                                            <span className={`text-sm font-black px-3 py-1 rounded-full ${rule.type === 'plus' ? 'bg-mint-light' : 'bg-red-50'}`}>
                                                                {rule.type === 'plus' ? `+ ${rule.points}` : rule.points}
                                                            </span>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${rule.type === 'plus' ? 'bg-mint text-white' : 'bg-red-500 text-white'}`}>
                                                                {rule.type === 'plus' ? <Plus size={20} strokeWidth={3} /> : <Minus size={20} strokeWidth={3} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {settingsSubTab === 'growth' && (
                                <motion.div 
                                    key="growth-settings" 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black text-[#555555] font-sans relative py-1 inline-block">
                                                成长阶段设置
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-rosy-light rounded-full -z-10" />
                                            </h4>
                                            <p className="text-xs text-[#888888] font-black tracking-widest uppercase mt-1">Configure level growth thresholds</p>
                                        </div>
                                        <button 
                                            onClick={() => alert('配置已自动保存至本地浏览器。')}
                                            className="bg-mint text-white px-6 py-2 rounded-xl font-black text-xs shadow-lg hover:bg-mint-dark transition-all flex items-center space-x-2"
                                        >
                                            <LayoutDashboard size={14} />
                                            <span>保存配置</span>
                                        </button>
                                    </div>

                                    <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl space-y-3">
                                        <div className="flex items-center space-x-2 text-orange-600 overflow-hidden">
                                            <Info size={16} />
                                            <span className="font-black text-sm uppercase tracking-wider">提示</span>
                                        </div>
                                        <p className="text-xs text-orange-600/80 font-bold leading-relaxed">
                                            这里的数值代表 <span className="text-orange-600 underline">升级到该等级</span> 所需的成长值。<br />
                                            例如 <span className="font-black text-black">Lv.1 → Lv.2</span> 需要 40点积分，意味着学生在 1级时积累 40点积分即可升到 2级。
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                                        {growthConfigs.map((step, idx) => (
                                            <div key={step.level} className={`p-6 rounded-[30px] border-2 transition-all flex items-center space-x-6 ${step.level === 7 ? 'bg-orange-50 border-orange-100' : 'bg-white/60 border-white/80'}`}>
                                                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center font-black text-orange-500 text-xl">{step.level}</div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                                            {step.level < 7 ? `Lv.${step.level} → Lv.${step.level+1} 所需积分` : '毕业状态'}
                                                        </span>
                                                    </div>
                                                    {step.level < 7 ? (
                                                        <input 
                                                            type="number" 
                                                            value={step.pointsRequired} 
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                setGrowthConfigs(prev => prev.map(c => c.level === step.level ? { ...c, pointsRequired: val } : c));
                                                            }}
                                                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-black focus:border-orange-300 outline-none transition-all shadow-inner" 
                                                        />
                                                    ) : (
                                                        <p className="text-sm font-black text-orange-600">🎓 {step.level} 级为满级，可以毕业</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {settingsSubTab === 'data' && (
                                <motion.div 
                                    key="data-settings" 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-4">
                                        <h4 className="text-2xl font-black text-[#555555] font-sans relative py-1 inline-block">
                                            数据管理
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rosy-light rounded-full -z-10" />
                                        </h4>
                                        <div className="bg-rosy-light/50 p-6 rounded-3xl border border-rosy-border text-sm font-black text-rosy space-y-2 leading-relaxed">
                                            <p>数据存储在浏览器本地缓存中，容易被清理掉，如果是公共电脑，建议经常导出数据保存备份。</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 border border-white/80 p-8 rounded-[40px] space-y-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-mint-light text-mint-dark rounded-2xl flex items-center justify-center">
                                                <Download size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-black text-[#555555] text-lg">数据导入与导出</h5>
                                                <p className="text-xs text-orange-500 font-bold mt-1">导出数据用于备份或其它浏览器中使用；数据导入会覆盖当前内容</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button 
                                                    onClick={exportData}
                                                    className="bg-mint text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-mint-light hover:bg-mint-dark transition-all"
                                                >
                                                    数据导出
                                                </button>
                                                <label className="bg-rosy text-white px-6 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-rosy-light hover:bg-rosy-dark transition-all cursor-pointer">
                                                    <span>数据导入</span>
                                                    <input type="file" accept=".json,.xlsx,.xls" onChange={importData} className="hidden" />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="h-px bg-white/60"></div>

                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-rosy-light text-rosy rounded-2xl flex items-center justify-center">
                                                <RotateCcw size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-black text-[#555555] text-lg">重置小店商品</h5>
                                                <p className="text-xs text-rosy-dark font-bold mt-1">将小店商品恢复为初始预设状态（不影响学生已有积分）</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    if (confirm('确定要恢复初始的小店商品吗？当前自定义商品将被覆盖。')) {
                                                        setStoreItems(DEFAULT_STORE_ITEMS);
                                                        alert('小店商品已恢复初始预设！');
                                                    }
                                                }}
                                                className="bg-white border-2 border-rosy-border text-rosy px-6 py-2.5 rounded-xl font-black text-sm hover:bg-rosy-light transition-all"
                                            >
                                                恢复预设
                                            </button>
                                        </div>

                                        <div className="h-px bg-white/60"></div>

                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center">
                                                <Trash2 size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-black text-[#555555] text-lg">评价数据重置</h5>
                                                <p className="text-xs text-red-400 font-bold mt-1">清空所有学生的得分数据、历史评价记录，此操作不可逆！</p>
                                            </div>
                                            <button 
                                                onClick={clearAllData}
                                                className="bg-red-500 text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
                                            >
                                                清空数据
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {settingsSubTab === 'help' && (
                                <motion.div 
                                    key="help-settings" 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="max-w-3xl mx-auto py-10"
                                >
                                    <div className="bg-[#FFFBEB]/70 backdrop-blur-md rounded-[50px] border border-gray-200/50 p-12 shadow-xl shadow-orange-100/20 relative overflow-hidden">
                                        {/* Decorative accents */}
                                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-rosy-light/30 rounded-full blur-3xl animate-pulse" />
                                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                                        <div className="relative z-10">
                                            <div className="flex flex-col items-center mb-12">
                                                <div className="w-24 h-24 bg-white rounded-[40px] shadow-sm flex items-center justify-center mb-6 text-rosy border border-white">
                                                    <Sparkles size={48} className="animate-bounce-slow" />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-4xl font-black text-rosy font-sans inline-block relative py-1 mb-2">
                                                        云宠小镇™ 班级宠物园
                                                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-rosy-light/80 rounded-full -z-10" />
                                                    </h4>
                                                    <p className="text-rosy font-black text-xs tracking-[0.3em] uppercase mt-2">VERSION v2.5.0 (STABLE)</p>
                                                </div>
                                            </div>

                                            <div className="space-y-10">
                                                <div className="space-y-8 text-center px-4">
                                                   <p className="text-xl text-[#555555] font-black leading-[1.6]">
                                                       班级宠物园是一款面向教师的班级管理应用，把班级管理、日常教学中的学生行为量化为积分，以饲养电子宠物的方式，激发学生自驱力、班级凝聚力。
                                                   </p>
                                                   <p className="text-xl text-[#555555] font-black leading-[1.6]">
                                                       适合幼儿园、小学、初中班主任和任课老师使用。
                                                   </p>
                                                </div>

                                                <div className="h-px bg-gray-200/50 w-full" />

                                                <div className="flex flex-col items-center space-y-6">
                                                    <div className="flex items-center space-x-3 text-[#F16589] font-black bg-white/50 px-8 py-5 rounded-[30px] border border-white shadow-sm ring-4 ring-rosy-light/50">
                                                        <Heart size={24} className="text-rosy" fill="currentColor" />
                                                        <span className="text-lg">反馈建议请联系微信: <span className="text-[#3B82F6] font-black underline decoration-2 underline-offset-4">lx123599605</span> <span className="text-[#F16589] opacity-60 ml-2">(暗号:云宠小镇)</span></span>
                                                    </div>
                                                    <div className="flex flex-col items-center space-y-2">
                                                        <p className="text-[12px] text-[#BBBBBB] font-black tracking-[0.4em] uppercase">Built with love for educators</p>
                                                        <p className="text-[10px] text-[#CCCCCC] font-black tracking-widest">© 2024 CLOUD PET TOWN TEAM. ALL RIGHTS RESERVED.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </main>
      <div className="fixed bottom-8 right-8 z-[60]">
        <button 
          onClick={() => {
            if (!lockPassword) {
              setIsSettingLock(true);
            } else {
              setIsLocked(true);
            }
          }}
          className="bg-white/80 backdrop-blur-md p-4 rounded-full shadow-2xl border-4 border-white hover:scale-110 active:scale-95 transition-all text-rosy hover:bg-rosy hover:text-white group"
        >
          <div className="star w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ top: '-10%', left: '50%' }}></div>
          <LogIn size={32} />
        </button>
      </div>

      {/* Screen Lock Overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paws.png")' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass max-w-lg w-full rounded-[40px] p-12 text-center space-y-8 border-4 border-white shadow-2xl"
            >
               <div className="w-24 h-24 bg-rosy rounded-[35px] flex items-center justify-center mx-auto shadow-xl transform rotate-3">
                  <Sparkles size={48} className="text-white" />
               </div>
               <div>
                 <h2 className="text-3xl font-black text-gray-800">屏幕已锁定</h2>
                 <p className="text-gray-400 font-bold mt-2">请输入锁屏密码以继续使用</p>
               </div>

               <div className="space-y-4">
                  <input 
                    type="password"
                    placeholder="输入日常解锁密码"
                    value={unlockInput}
                    onChange={(e) => setUnlockInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (unlockInput === lockPassword || unlockInput === lockSafetyCode || unlockInput === '987') {
                          setIsLocked(false);
                          setUnlockInput('');
                        } else {
                          alert('提示：密码错误惹~ 可输入安全码或万能密码 987 解锁。');
                        }
                      }
                    }}
                    className="w-full bg-white/60 border-2 border-white/80 px-8 py-5 rounded-[25px] text-xl font-bold focus:bg-white focus:border-rosy-border/50 outline-none transition-all text-center placeholder:text-gray-300 shadow-inner"
                  />
                  <button 
                    onClick={() => {
                        if (unlockInput === lockPassword || unlockInput === lockSafetyCode || unlockInput === '987') {
                          setIsLocked(false);
                          setUnlockInput('');
                        } else {
                          alert('提示：密码错误惹~ 可输入安全码或万能密码 987 解锁。');
                        }
                    }}
                    className="w-full bg-rosy text-white py-5 rounded-[25px] font-black text-xl shadow-lg shadow-rosy-light hover:bg-rosy-dark transition-all"
                  >
                    解除锁定
                  </button>
                  <button 
                    onClick={() => {
                      const ans = prompt('安全验证：请输入安全码或万能解锁密码 (987) 以继续');
                      if (ans === lockSafetyCode || ans === '987') {
                        setIsLocked(false);
                        setUnlockInput('');
                        alert('解锁成功！建议前往设置重新配置密码。');
                      } else {
                        alert('密码或安全码不正确！');
                      }
                    }}
                    className="text-gray-400 text-xs font-bold hover:text-blue-400"
                  >
                    忘记密码？
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock Settings Modal (Based on Reference Image) */}
      <AnimatePresence>
        {isSettingLock && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsSettingLock(false)}
               className="absolute inset-0 bg-black/40 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="relative bg-white w-full max-w-4xl h-[560px] rounded-[30px] overflow-hidden flex shadow-2xl"
             >
                {/* Left Section - Informational */}
                <div className="w-1/2 bg-rosy-dark p-12 flex flex-col items-center justify-center text-white text-center space-y-8" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/grid-me.png")' }}>
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[30px] p-5 border border-white/20">
                       <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-rosy">
                          <LogIn size={40} strokeWidth={3} />
                       </div>
                    </div>
                    <div>
                       <h3 className="text-2xl font-black tracking-tight">云宠小镇™ 班级宠物园</h3>
                    </div>
                    <div className="space-y-4 text-left w-full text-white/80 font-medium text-sm leading-relaxed">
                       <p>1、设置锁屏后可以最大程度避免学生误操作。</p>
                       <p>2、当前设置的锁屏密码只是相对安全。</p>
                       <p>3、更高安全要求，建议使用电脑版。</p>
                    </div>
                </div>

                {/* Right Section - Input */}
                <div className="w-1/2 p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-black text-gray-800 mb-8">设置锁屏密码</h2>
                    
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400">锁屏密码</label>
                          <input 
                            type="password"
                            placeholder="日常解锁屏幕用"
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            className="w-full border-2 border-gray-100 px-6 py-4 rounded-xl focus:border-rosy-border/50 outline-none transition-all font-bold text-gray-700"
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400">安全码（请牢记）</label>
                          <input 
                            type="text"
                            placeholder="用于重置锁屏密码"
                            value={tempSafetyCode}
                            onChange={(e) => setTempSafetyCode(e.target.value)}
                            className="w-full border-2 border-gray-100 px-6 py-4 rounded-xl focus:border-rosy-border/50 outline-none transition-all font-bold text-gray-700"
                          />
                       </div>

                       <button 
                        onClick={() => {
                          if (!tempPassword || !tempSafetyCode) {
                            alert('小主，密码和安全码都要填喔~');
                            return;
                          }
                          saveLockSettings(tempPassword, tempSafetyCode);
                        }}
                        className="w-full bg-rosy text-white py-5 rounded-xl font-black text-xl shadow-lg hover:bg-rosy-dark transition-all"
                       >
                         保存
                       </button>

                       <button 
                        onClick={() => setIsSettingLock(false)}
                        className="w-full text-rosy font-bold py-2 mt-2 hover:bg-rosy-light rounded-lg transition-all"
                       >
                         本次跳过
                       </button>
                    </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {/* Class Creation Modal (Image 1 Style Management) */}
        {isClassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsClassModalOpen(false)}
               className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
               initial={{ scale: 0.9, y: 20, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.9, y: 20, opacity: 0 }}
               className="bg-white relative w-full max-w-6xl h-[80vh] rounded-[30px] overflow-hidden flex shadow-2xl"
            >
              <div className="absolute top-6 right-6 z-30">
                 <button onClick={() => setIsClassModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                    <X size={24} />
                 </button>
              </div>

              {/*sidebar: Class List */}
              <div className="w-80 bg-gray-50/50 border-r border-gray-100 flex flex-col">
                 <div className="p-8 border-b border-gray-100 bg-gray-50/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-black text-gray-800 flex items-center space-x-2 text-rosy">
                           <LayoutDashboard size={20} />
                           <span>班级列表</span>
                        </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input 
                            id="new-class-name-inline"
                            placeholder="输入班级名称..."
                            className="flex-1 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold outline-none focus:border-orange-300 shadow-sm"
                        />
                        <button 
                           onClick={() => {
                              const input = document.getElementById('new-class-name-inline') as HTMLInputElement;
                              if (input.value) {
                                  addClass(input.value);
                                  input.value = '';
                              }
                           }}
                           className="p-2 bg-rosy text-white rounded-xl shadow-lg hover:bg-rosy-dark transition-all active:scale-95"
                        >
                           <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {classes.map(c => (
                        <div 
                          key={c.id} 
                          className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${currentClassId === c.id ? 'bg-rosy text-white shadow-lg' : 'hover:bg-white hover:shadow-sm text-gray-600'}`}
                          onClick={() => setCurrentClassId(c.id)}
                        >
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <Users size={16} className={currentClassId === c.id ? 'text-white' : 'text-gray-400'} />
                                <span className="font-bold truncate">{c.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                                {currentClassId === c.id && (
                                   <div className="bg-white/20 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">当前</div>
                                )}
                                <button 
                                    className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all ${currentClassId === c.id ? 'bg-white/20 text-white' : 'bg-rosy-light text-rosy'} hover:scale-110 active:scale-90`}
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setClassToDelete(c.id); 
                                    }} 
                                    title="删除班级"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button 
                                    className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all ${currentClassId === c.id ? 'bg-white/20 text-white' : 'bg-rosy-light text-rosy'} hover:scale-110 active:scale-90`}
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      const newName = window.prompt('请输入新的班级名称', c.name);
                                      if (newName && newName.trim()) {
                                        setClasses(prev => prev.map(cl => cl.id === c.id ? { ...cl, name: newName.trim() } : cl));
                                      }
                                    }} 
                                    title="修改名称"
                                >
                                    <Pencil size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>

              {/* Main Content: Student Management */}
              <div className="flex-1 flex flex-col bg-white">
                 <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-3xl font-black text-gray-800">{currentClass?.name || '请选择班级'}</h2>
                        <div className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                            {classStudents.length} 位学生
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="bg-white border-2 border-gray-100 px-6 py-2.5 rounded-xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer flex items-center space-x-2">
                            <Upload size={18} />
                            <span>批量导入</span>
                            <input type="file" accept=".xlsx, .xls" onChange={importExcelStudents} className="hidden" />
                        </label>
                    </div>
                 </div>

                 <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Add Student Inline Form */}
                    <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex justify-center">
                        <div className="flex items-center space-x-4 max-w-2xl w-full">
                            <div className="flex flex-1 items-center space-x-3">
                               <UserPlus size={20} className="text-rosy" />
                               <span className="font-black text-gray-700 text-sm whitespace-nowrap">添加新学生</span>
                            </div>
                            <div className="flex-1 flex items-center space-x-3 max-w-md">
                               <input 
                                 id="add-stu-name" 
                                 placeholder="只可录入文字" 
                                 className="w-32 bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-rosy-border shadow-sm placeholder:text-gray-400/60"
                               />
                               <input 
                                 id="add-stu-no" 
                                 placeholder="学号 (可选)" 
                                 className="flex-1 bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-rosy-border shadow-sm placeholder:text-gray-400/60"
                               />
                               <button 
                                 onClick={() => {
                                    const nInput = document.getElementById('add-stu-name') as HTMLInputElement;
                                    const noInput = document.getElementById('add-stu-no') as HTMLInputElement;
                                    if (nInput.value) {
                                        addStudent(nInput.value, noInput.value);
                                        nInput.value = '';
                                        noInput.value = '';
                                    }
                                 }}
                                 className="bg-rosy text-white p-2.5 rounded-xl shadow-lg hover:bg-rosy-dark transition-all active:scale-95 flex-shrink-0"
                               >
                                  <Plus size={20} strokeWidth={3} />
                               </button>
                            </div>
                        </div>
                    </div>

                    {/* Student List View */}
                    <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar content-start">
                        {allClassStudents.map(student => (
                            <div 
                              key={student.id} 
                              className="bg-rosy-light text-rosy py-3 px-5 rounded-2xl flex items-center justify-between group hover:bg-rosy-light hover:shadow-lg transition-all border border-rosy-border"
                            >
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 shrink-0 bg-white text-rosy rounded-xl flex items-center justify-center font-black text-sm shadow-sm border border-rosy-border">
                                        {student.name.slice(0, 1)}
                                    </div>
                                    <div className="min-w-0 flex items-baseline">
                                        <h4 className="font-black text-sm truncate mr-2">{student.name}</h4>
                                        {student.studentNo && (
                                            <span className="text-[11px] font-bold opacity-60 truncate">#{student.studentNo}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1 shrink-0 ml-4 transition-all">
                                    <button 
                                      onClick={(e) => {
                                         e.stopPropagation();
                                         setEditingStudentData(student);
                                         setIsEditStudentModalOpen(true);
                                      }}
                                      className="p-2 text-rosy/40 hover:text-rosy hover:bg-white/50 rounded-xl transition-all"
                                      title="修改"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Confirm Button */}
                    <div className="p-8 border-t border-gray-100 bg-gray-50/20 flex justify-end">
                         <button 
                            onClick={() => setIsClassModalOpen(false)}
                            className="bg-rosy text-white px-12 py-3 rounded-2xl font-black shadow-xl shadow-rosy-light hover:bg-rosy-dark transition-all transform active:scale-95 flex items-center space-x-2"
                         >
                            <Check size={20} strokeWidth={3} />
                            <span>确认</span>
                         </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Student Modal */}
        {isAddStudentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsAddStudentModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div 
               initial={{ scale: 0.9, y: 20, opacity: 0 }}
               animate={{ scale: 1, y: 0, opacity: 1 }}
               exit={{ scale: 0.9, y: 20, opacity: 0 }}
               className="bg-white relative w-full max-w-md rounded-[45px] p-10 space-y-8 shadow-2xl overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-mint-light/20 rounded-full blur-3xl -mr-16 -mt-16" />
               <h3 className="text-3xl font-black text-[#2D4256] tracking-tight relative z-10 flex items-center">
                  <UserPlus size={28} className="mr-3 text-mint-dark" />
                  邀请新同学
               </h3>
               
               <div className="space-y-6 relative z-10">
                  <div className="space-y-3">
                     <label className="text-xs font-black text-[#94A3B8] uppercase tracking-[0.2em] ml-2">小朋友姓名</label>
                     <input 
                       id="new-student-name"
                       type="text" 
                       placeholder="请输入姓名..."
                       className="w-full bg-[#F8FAFC] border-[3px] border-[#F1F5F9] rounded-[28px] px-8 py-5 text-lg font-bold focus:bg-white focus:ring-[12px] focus:ring-mint-light/10 focus:border-mint-border transition-all outline-none"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-xs font-black text-[#94A3B8] uppercase tracking-[0.2em] ml-2">学号（选填）</label>
                     <input 
                       id="new-student-no"
                       type="text" 
                       placeholder="请输入学号..."
                       className="w-full bg-[#F8FAFC] border-[3px] border-[#F1F5F9] rounded-[28px] px-8 py-5 text-lg font-bold focus:bg-white focus:ring-[12px] focus:ring-mint-light/10 focus:border-mint-border transition-all outline-none"
                     />
                  </div>
               </div>

               <div className="flex flex-col space-y-3 pt-4 relative z-10">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const name = (document.getElementById('new-student-name') as HTMLInputElement).value;
                      const no = (document.getElementById('new-student-no') as HTMLInputElement).value;
                      if (!name) return alert('请输入姓名哦！');
                      addStudent(name, no);
                      setIsAddStudentModalOpen(false);
                    }}
                    className="w-full bg-mint text-[#2D6A4F] py-5 rounded-[28px] font-black text-xl shadow-lg shadow-mint-light hover:bg-mint-dark transition-all border-b-[6px] border-mint-dark"
                  >
                    确认邀请入镇
                  </motion.button>
                  <button 
                    onClick={() => setIsAddStudentModalOpen(false)}
                    className="w-full py-4 text-[#94A3B8] font-bold hover:text-[#2D4256] transition-colors"
                  >
                    稍后再说
                  </button>
               </div>
            </motion.div>
          </div>
        )}
        {isEditStudentModalOpen && editingStudentData && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsEditStudentModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
             <motion.div className="glass p-10 relative w-full max-w-md rounded-[45px] space-y-6">
                <h3 className="text-2xl font-black text-gray-700 font-display">修改学生资料</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">学生姓名</label>
                        <input id="edit-stu-name-input" defaultValue={editingStudentData.name} className="w-full bg-white/60 px-6 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">学号</label>
                        <input id="edit-stu-no-input" defaultValue={editingStudentData.studentNo} className="w-full bg-white/60 px-6 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold" />
                    </div>
                </div>
                <div className="flex flex-col space-y-3">
                    <button 
                        onClick={() => {
                            const name = (document.getElementById('edit-stu-name-input') as HTMLInputElement).value;
                            const no = (document.getElementById('edit-stu-no-input') as HTMLInputElement).value;
                            if (name) {
                                updateStudent(editingStudentData.id, { name, studentNo: no });
                                setIsEditStudentModalOpen(false);
                            }
                        }}
                        className="w-full bg-[#F69D9E] text-white py-5 rounded-[28px] font-black shadow-xl shadow-orange-100 hover:bg-[#FF8E20] transition-all"
                    >
                        确认保存
                    </button>
                </div>
             </motion.div>
           </div>
        )}

        {/* Student Creation Modal */}
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               onClick={() => setIsStudentModalOpen(false)}
               className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div className="glass p-6 sm:p-10 relative w-full max-w-sm sm:max-w-md rounded-[35px] sm:rounded-[45px] shadow-2xl">
                <div className="flex items-center justify-between mb-6 sm:mb-10">
                    <h3 className="text-xl sm:text-2xl font-black text-gray-700 font-display">邀请新同学</h3>
                    <button onClick={() => setIsStudentModalOpen(false)} className="p-2 hover:bg-white/60 rounded-full transition-all sm:hidden"><X size={20} /></button>
                </div>
                <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">小朋友姓名</label>
                        <input id="stud-name" placeholder="请输入姓名..." className="w-full bg-white/60 px-5 sm:px-6 py-3 sm:py-4 rounded-[20px] sm:rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold shadow-inner text-sm sm:text-base" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">学号 (选填)</label>
                        <input id="stud-no" placeholder="请输入学号..." className="w-full bg-white/60 px-5 sm:px-6 py-3 sm:py-4 rounded-[20px] sm:rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold shadow-inner text-sm sm:text-base" />
                    </div>
                    <div className="pt-2">
                        <button 
                            onClick={() => {
                                const n = document.getElementById('stud-name') as HTMLInputElement;
                                const s = document.getElementById('stud-no') as HTMLInputElement;
                                if (n.value) {
                                    addStudent(n.value, s.value);
                                    setIsStudentModalOpen(false);
                                }
                            }}
                            className="w-full bg-mint text-white py-4 sm:py-5 rounded-[22px] sm:rounded-[28px] font-black shadow-xl shadow-mint-light hover:bg-mint-dark hover:scale-[1.02] transition-all text-base sm:text-lg active:scale-95"
                        >确认添加新同学</button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}

        {/* Pet Selection Modal */}
        {isPetSelectModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex flex-col p-4 sm:p-10 overflow-y-auto">
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-[#FDF2F7] via-[#F0F7FF] to-[#F1F3FF] backdrop-blur-3xl"
             />
             <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col items-center">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-16 gap-4">
                    <div className="flex items-center space-x-4 sm:space-x-6 text-center sm:text-left">
                        <div className="w-12 h-12 sm:w-20 sm:h-20 bg-yellow-300 rounded-full flex items-center justify-center text-3xl sm:text-5xl shadow-xl animate-bounce shrink-0">🐣</div>
                        <div>
                            <h2 className="text-2xl sm:text-5xl font-black text-gray-700 font-display">
                                为 <span className="text-rosy">{selectedStudent.name}</span> 选择宠物
                            </h2>
                            <p className="text-xs sm:text-lg font-bold text-gray-400 leading-relaxed">选一个最喜欢的伙伴一起在小镇快乐成长吧！</p>
                        </div>
                    </div>
                    
                    {/* Selected Student Preview - Smaller Scale */}
                    <div className="flex items-center bg-white/60 backdrop-blur-sm border-2 border-white rounded-[25px] p-3 sm:p-4 shadow-sm">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-rosy-light rounded-[18px] flex items-center justify-center shrink-0">
                             <PetDisplay pet={PETS.find(p => p.id === selectedStudent.petId)} level={selectedStudent.level} fill={true} />
                        </div>
                        <div className="ml-3 text-left">
                            <p className="text-[9px] sm:text-[10px] font-black text-rosy uppercase tracking-widest leading-none">当前契约</p>
                            <p className="text-sm sm:text-lg font-black text-gray-700 leading-none mt-1.5">{selectedStudent.name}</p>
                        </div>
                        <button onClick={() => setIsPetSelectModalOpen(false)} className="ml-4 sm:ml-6 p-2 hover:bg-white/40 rounded-full transition-all shrink-0"><X size={20} className="sm:size-8" /></button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-10 w-full mb-10">
                    {PETS.map((pet, index) => {
                        const bgColor = MACARON_COLORS[index % MACARON_COLORS.length];
                        
                        return (
                          <motion.div 
                              key={pet.id}
                              whileHover={{ y: -10, scale: 1.03 }}
                              onClick={() => selectPet(selectedStudent.id, pet.id)}
                              className={`${bgColor} p-4 sm:p-7 rounded-[35px] sm:rounded-[50px] border-3 sm:border-4 border-white hover:shadow-2xl hover:shadow-rosy-light transition-all cursor-pointer group text-center shadow-lg shadow-black/5 active:scale-95 flex flex-col`}
                          >
                              <div className="aspect-square rounded-[25px] sm:rounded-[40px] overflow-hidden mb-4 sm:mb-6 bg-white border-2 border-white shadow-inner flex items-center justify-center transition-all">
                                  <div className="w-full h-full transform group-hover:scale-110 transition-transform">
                                      <PetDisplay pet={pet} level={selectedStudent.level} forceMax={true} fill={true} />
                                  </div>
                              </div>
                              <h4 className="font-black text-lg sm:text-2xl mb-1 sm:mb-2 text-gray-800 leading-none">{pet.name}</h4>
                              <p className="text-[8px] sm:text-[10px] text-gray-600 font-bold opacity-70 leading-relaxed px-1 sm:px-2 uppercase tracking-wide flex-grow">{pet.description}</p>
                              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="bg-white/80 text-rosy px-5 py-2 rounded-full text-[10px] sm:text-xs font-black shadow-sm">点击缔结契约</span>
                              </div>
                          </motion.div>
                        );
                    })}
                </div>
             </div>
          </div>
        )}

        {/* Rule Edit Modal */}
        {isRuleModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsRuleModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
             <motion.div className="glass p-10 relative w-full max-w-md rounded-[45px] space-y-6">
                <h3 className="text-2xl font-black text-gray-700 font-display">{editingRuleData ? '修改评价指标' : '添加新指标'}</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">指标名称</label>
                        <input id="rule-label-input" defaultValue={editingRuleData?.label} placeholder="如：平时测验满分" className="w-full bg-white/60 px-6 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">分值 (正加负减)</label>
                            <input id="rule-points-input" type="number" defaultValue={editingRuleData ? (editingRuleData.type === 'plus' ? editingRuleData.points : -editingRuleData.points) : 3} className="w-full bg-white/60 px-6 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-black text-center" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">分类</label>
                            <select id="rule-category-input" defaultValue={editingRuleData?.category || ruleCategoryFilter} className="w-full bg-white/60 px-4 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold appearance-none">
                                <option value="study">学习</option>
                                <option value="behavior">行为</option>
                                <option value="health">健康</option>
                                <option value="other">其他</option>
                                <option value="kindergarten">幼儿园</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">图标 (Lucide)</label>
                        <select id="rule-icon-input" defaultValue={editingRuleData?.icon || 'Sparkles'} className="w-full bg-white/60 px-4 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold appearance-none">
                            <option value="Sparkles">闪亮 (Sparkles)</option>
                            <option value="Book">书本 (Book)</option>
                            <option value="Users">人群 (Users)</option>
                            <option value="Heart">爱心 (Heart)</option>
                            <option value="Clock">时钟 (Clock)</option>
                            <option value="FileText">文档 (FileText)</option>
                            <option value="Sunrise">日出 (Sunrise)</option>
                            <option value="Trophy">奖杯 (Trophy)</option>
                            <option value="Star">星星 (Star)</option>
                        </select>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        const label = (document.getElementById('rule-label-input') as HTMLInputElement).value;
                        const pts = parseInt((document.getElementById('rule-points-input') as HTMLInputElement).value);
                        const category = (document.getElementById('rule-category-input') as HTMLSelectElement).value;
                        const icon = (document.getElementById('rule-icon-input') as HTMLSelectElement).value;
                        
                        if (label && !isNaN(pts)) {
                            if (editingRuleData) {
                                updateScoringRule(editingRuleData.id, {
                                    label,
                                    points: Math.abs(pts),
                                    type: pts >= 0 ? 'plus' : 'minus',
                                    category: category as any,
                                    icon
                                });
                            } else {
                                addScoringRule({
                                    label,
                                    points: Math.abs(pts),
                                    type: pts >= 0 ? 'plus' : 'minus',
                                    category: category as any,
                                    icon
                                });
                            }
                            setIsRuleModalOpen(false);
                            setEditingRuleData(null);
                        }
                    }}
                    className="w-full bg-mint text-white py-5 rounded-[28px] font-black shadow-xl shadow-mint-light hover:bg-mint-dark transition-all active:scale-95"
                >
                    确认提交
                </button>
             </motion.div>
           </div>
        )}

        {/* Store Item Modal (Add/Edit) */}
        {isStoreModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsStoreModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div className="glass p-10 relative w-full max-w-md rounded-[45px] space-y-6">
                <h3 className="text-2xl font-black text-gray-700 font-display">{editingStoreItem ? '编辑卡片' : '添加新卡片'}</h3>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">卡片名称</label>
                        <input id="store-item-name" defaultValue={editingStoreItem?.name} placeholder="如：零食券" className="w-full bg-white/60 px-6 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">项目描述</label>
                        <input id="store-item-desc" defaultValue={editingStoreItem?.description} placeholder="如：兑换一份可口的零食" className="w-full bg-white/60 px-6 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">兑换积分</label>
                            <input id="store-item-price" type="number" defaultValue={editingStoreItem?.price || 1} className="w-full bg-white/60 px-6 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">库存数量</label>
                            <input id="store-item-stock" type="number" defaultValue={editingStoreItem?.stock || 10} className="w-full bg-white/60 px-6 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">选择图标</label>
                        <select id="store-item-icon" defaultValue={editingStoreItem?.icon || 'Cookie'} className="w-full bg-white/60 px-6 py-4 rounded-[25px] border border-white/60 focus:bg-white outline-none transition-all font-bold">
                            <option value="Cookie">小零食 (Cookie)</option>
                            <option value="FileText">减免证 (FileText)</option>
                            <option value="Monitor">前排座 (Monitor)</option>
                            <option value="Users">选同桌 (Users)</option>
                            <option value="Sparkles">表扬卡 (Sparkles)</option>
                            <option value="Scissors">小助手 (Scissors)</option>
                            <option value="Trophy">奖杯奖章 (Trophy)</option>
                            <option value="Gift">神秘大礼 (Gift)</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        const name = (document.getElementById('store-item-name') as HTMLInputElement).value;
                        const description = (document.getElementById('store-item-desc') as HTMLInputElement).value;
                        const price = parseInt((document.getElementById('store-item-price') as HTMLInputElement).value);
                        const stock = parseInt((document.getElementById('store-item-stock') as HTMLInputElement).value);
                        const icon = (document.getElementById('store-item-icon') as HTMLSelectElement).value;

                        if (name && !isNaN(price) && !isNaN(stock)) {
                            if (editingStoreItem) {
                                updateStoreItem(editingStoreItem.id, { name, description, price, stock, icon: icon as any });
                            } else {
                                addStoreItem({ name, description, price, stock, icon: icon as any });
                            }
                            setIsStoreModalOpen(false);
                        }
                    }}
                    className="w-full bg-mint text-white py-5 rounded-[28px] font-black shadow-xl shadow-mint-light hover:bg-mint-dark transition-all font-display"
                >
                    {editingStoreItem ? '保存修改' : '确认添加'}
                </button>
            </motion.div>
          </div>
        )}

        {/* Redemption Selector Modal */}
        {isRedeemModalOpen && selectedItemToRedeem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsRedeemModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div className="glass p-10 relative w-full max-w-2xl rounded-[40px] flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between mb-8 flex-shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-gray-700 font-display">选择兑换学生</h3>
                        <p className="text-sm font-bold text-gray-400">正在兑换: <span className="text-rosy">{selectedItemToRedeem.name}</span> ({selectedItemToRedeem.price} 积分)</p>
                    </div>
                    <button onClick={() => setIsRedeemModalOpen(false)} className="p-2 hover:bg-white/60 rounded-full transition-all flex-shrink-0"><X /></button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto p-2 custom-scrollbar">
                    {students.filter(s => s.classId === currentClassId).map(student => (
                      <button 
                        key={student.id}
                        disabled={student.points < selectedItemToRedeem.price || selectedItemToRedeem.stock <= 0}
                        onClick={() => {
                            redeemItem(student.id, selectedItemToRedeem);
                            setIsRedeemModalOpen(false);
                        }}
                        className={`p-4 rounded-[30px] border-2 transition-all flex flex-col items-center space-y-2 group
                            ${student.points < selectedItemToRedeem.price 
                                ? 'bg-gray-50 border-gray-100 opacity-50 grayscale cursor-not-allowed' 
                                : 'bg-white border-white hover:border-rosy-border/50 hover:shadow-lg shadow-black/5'}
                        `}
                      >
                         <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden mb-1">
                             <PetDisplay pet={PETS.find(p => p.id === student.petId)} level={student.level} fill={true} />
                         </div>
                         <span className="font-bold text-gray-700">{student.name}</span>
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${student.points < selectedItemToRedeem.price ? 'bg-red-50 text-red-400' : 'bg-rosy-light text-rosy'}`}>
                            {student.points} 积分
                         </span>
                      </button>
                    ))}
                </div>
            </motion.div>
          </div>
        )}

        {isScoringModalOpen && (isBatchMode || selectedStudent) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               onClick={() => {
                   setIsScoringModalOpen(false);
                   if (isBatchMode) setIsBatchMode(false);
               }}
               className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
                className="glass relative w-full max-w-4xl rounded-[30px] sm:rounded-[40px] flex flex-col h-[90vh] md:h-auto max-h-[92vh] md:max-h-[85vh] overflow-hidden"
            >
                <div className="p-4 sm:p-8 border-b border-white/30 flex items-center justify-between">
                    <div className="min-w-0 pr-4">
                        <h3 className="text-base sm:text-xl font-black text-gray-700 flex items-center whitespace-nowrap tracking-tighter gap-1.5 sm:gap-2">
                            {isBatchMode ? (
                                <>
                                    <span className="shrink-0">给所选的</span>
                                    <span className="text-orange-500 bg-white/60 px-2 sm:px-4 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl border border-white/50 shrink-0">{selectedStudentIds.length}</span>
                                    <span className="shrink-0">位同学批量评分</span>
                                    <div className="hidden sm:flex flex-wrap gap-1 ml-2">
                                        {students.filter(s => selectedStudentIds.includes(s.id)).slice(0, 3).map(s => (
                                            <span key={s.id} className="text-[10px] bg-white/40 border border-white/50 px-2 py-0.5 rounded-full text-gray-500 font-bold max-w-[60px] truncate">{s.name}</span>
                                        ))}
                                        {selectedStudentIds.length > 3 && (
                                            <span className="text-[10px] text-gray-400 font-bold ml-1">...</span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="shrink-0">给</span>
                                    <span className="text-rosy bg-white/60 px-2 sm:px-4 py-0.5 sm:py-1 rounded-xl sm:rounded-2xl border border-white/50 truncate max-w-[100px] sm:max-w-[150px]">{selectedStudent?.name}</span>
                                    <span className="shrink-0">评分</span>
                                </>
                            )}
                        </h3>
                        {!isBatchMode && selectedStudent && (
                            <div className="mt-1 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1 sm:space-x-2">
                                <span>当前等级 {selectedStudent.level}</span>
                                <span className="opacity-30">•</span>
                                <span className="text-rosy truncate">还差 {getLevelProgress(selectedStudent.points, growthConfigs).pointsRemaining} 分升级</span>
                            </div>
                        )}
                        {isBatchMode && (
                             <div className="mt-1 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                正在进行批量成长性评价
                             </div>
                        )}
                    </div>
                    <button onClick={() => setIsScoringModalOpen(false)} className="p-2 hover:bg-white/60 rounded-full transition-all flex-shrink-0"><X size={20} className="sm:size-6" /></button>
                </div>

                {viewMode === 'teacher' ? (
                    <>
                        {/* Category Tabs */}
                        <div className="px-2 sm:px-8 py-3 border-b border-white/20 flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto no-scrollbar bg-white/20 backdrop-blur-sm sticky top-0 z-10 scrollbar-hide">
                            {[
                                { id: 'all', label: '全部', icon: Sparkles },
                                { id: 'study', label: '学习', icon: Book },
                                { id: 'behavior', label: '行为', icon: Users },
                                { id: 'health', label: '健康', icon: Heart },
                                { id: 'kindergarten', label: '习惯', icon: GraduationCap },
                                { id: 'other', label: '其他', icon: LayoutDashboard },
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setScoringCategory(cat.id)}
                                    className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[10px] sm:text-xs md:text-sm font-black transition-all whitespace-nowrap ${scoringCategory === cat.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white/50 text-gray-400 hover:bg-white'}`}
                                >
                                    <cat.icon size={14} className="sm:size-4" />
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 p-3 sm:p-8 overflow-y-auto custom-scrollbar">
                            <div className="space-y-6 sm:space-y-10">
                                {/* Positive Items */}
                                {(scoringCategory === 'all' || scoringRules.some(r => r.category === scoringCategory && r.type === 'plus')) && (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center space-x-2 px-1 text-mint-dark">
                                        <Sparkles size={16} sm:size={18} />
                                        <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest">加分项</h4>
                                        <div className="flex-1 h-px bg-mint-border ml-2 opacity-30"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {scoringRules
                                            .filter(r => (scoringCategory === 'all' || r.category === scoringCategory) && r.type === 'plus')
                                            .sort((a, b) => b.points - a.points)
                                            .map(rule => (
                                            <button 
                                                key={rule.id}
                                                onClick={() => {
                                                    if (isBatchMode) {
                                                        batchUpdatePoints(rule);
                                                    } else if (selectedStudent) {
                                                        updatePoints(selectedStudent.id, rule);
                                                        setIsScoringModalOpen(false);
                                                    }
                                                }}
                                                className="flex items-center justify-between p-3 sm:p-4 bg-white/60 border-2 border-white/80 rounded-[20px] sm:rounded-[24px] hover:bg-white hover:border-mint-border hover:shadow-lg transition-all group"
                                            >
                                                <div className="flex items-center space-x-2 sm:space-x-3 shrink-1 min-w-0">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-mint-light text-mint-dark flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                        {rule.icon === 'Sparkles' ? <Sparkles size={16} sm:size={18} /> : 
                                                         rule.icon === 'Book' ? <Book size={16} sm:size={18} /> :
                                                         rule.icon === 'Users' ? <Users size={16} sm:size={18} /> :
                                                         rule.icon === 'Heart' ? <Heart size={16} sm:size={18} /> :
                                                         rule.icon === 'Clock' ? <Clock size={14} sm:size={16} /> :
                                                         <Sparkles size={16} sm:size={18} />}
                                                    </div>
                                                    <span className="font-bold text-xs sm:text-sm text-gray-700 truncate text-left">{rule.label}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                                                    <span className="text-[10px] sm:text-sm font-black text-mint-dark bg-mint-light px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">+ {rule.points}</span>
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-mint text-white flex items-center justify-center shadow-sm">
                                                        <Plus size={12} sm:size={16} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                )}

                                {/* Negative Items */}
                                {(scoringCategory === 'all' || scoringRules.some(r => r.category === scoringCategory && r.type === 'minus')) && (
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center space-x-2 px-1 text-red-500">
                                        <AlertTriangle size={16} sm:size={18} />
                                        <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest">扣分项</h4>
                                        <div className="flex-1 h-px bg-red-100 ml-2 opacity-30"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {scoringRules
                                            .filter(r => (scoringCategory === 'all' || r.category === scoringCategory) && r.type === 'minus')
                                            .sort((a, b) => b.points - a.points)
                                            .map(rule => (
                                            <button 
                                                key={rule.id}
                                                onClick={() => {
                                                    if (isBatchMode) {
                                                        batchUpdatePoints(rule);
                                                    } else if (selectedStudent) {
                                                        updatePoints(selectedStudent.id, rule);
                                                        setIsScoringModalOpen(false);
                                                    }
                                                }}
                                                className="flex items-center justify-between p-3 sm:p-4 bg-white/60 border-2 border-white/80 rounded-[20px] sm:rounded-[24px] hover:bg-white hover:border-red-200 hover:shadow-lg transition-all group"
                                            >
                                                <div className="flex items-center space-x-2 sm:space-x-3 shrink-1 min-w-0">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                        {rule.icon === 'Sparkles' ? <Sparkles size={16} sm:size={18} /> : 
                                                         rule.icon === 'Book' ? <Book size={16} sm:size={18} /> :
                                                         rule.icon === 'Users' ? <Users size={16} sm:size={18} /> :
                                                         rule.icon === 'Heart' ? <Heart size={16} sm:size={18} /> :
                                                         rule.icon === 'Clock' ? <Clock size={14} sm:size={16} /> :
                                                         <Zap size={16} sm:size={18} />}
                                                    </div>
                                                    <span className="font-bold text-xs sm:text-sm text-gray-700 truncate text-left">{rule.label}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                                                    <span className="text-[10px] sm:text-sm font-black text-red-500 bg-red-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">{rule.points}</span>
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm">
                                                        <Minus size={12} sm:size={16} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                )}

                                {/* Level info message during scoring */}
                                <div className="mt-6 sm:mt-10 px-4 sm:px-6 py-4 sm:py-5 bg-rosy-light rounded-[24px] sm:rounded-[30px] border-2 border-rosy-border flex items-center justify-between">
                                    {(() => {
                                        const currentLevel = isBatchMode 
                                            ? "多位小伙伴" 
                                            : selectedStudent?.level || 1;
                                        const remaining = isBatchMode 
                                            ? "--" 
                                            : selectedStudent ? getLevelProgress(selectedStudent.points, growthConfigs).pointsRemaining : "--";
                                        return (
                                            <p className="text-rosy font-bold text-xs sm:text-sm">
                                                ✨ 当前等级 <span className="text-rosy-dark font-black px-0.5 sm:px-1">{currentLevel}</span>，还差 <span className="text-rosy-dark font-black px-0.5 sm:px-1">{remaining}</span> 分升级
                                            </p>
                                        );
                                    })() }
                                    <Sparkles className="text-rosy-border shrink-0" size={16} sm:size={20} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar bg-gradient-to-b from-white/40 to-transparent flex items-center justify-center">
                         <div className="text-center space-y-4 sm:space-y-6">
                            <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto">
                                <PetDisplay pet={PETS.find(p => p.id === selectedStudent?.petId)} level={selectedStudent?.level || 1} fill={true} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-gray-800">操作已成功！</h3>
                            <p className="text-sm sm:text-base text-gray-500 font-bold">小宠已经感受到了满满的爱意</p>
                            <button 
                                onClick={() => setIsScoringModalOpen(false)}
                                className="px-8 sm:px-12 py-3 sm:py-5 bg-rosy text-white rounded-[24px] sm:rounded-[30px] font-black text-base sm:text-xl shadow-2xl shadow-rosy-light hover:scale-105 active:scale-95 transition-all outline-none"
                            >
                                收到！我会陪宝贝继续努力
                            </button>
                         </div>
                    </div>
                )}

            </motion.div>
          </div>
        )}

        {/* Level Up Animation */}
        <AnimatePresence>
          {levelUpInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md overflow-hidden"
              onClick={() => setLevelUpInfo(null)}
            >
              {/* Radial Light Rays / Sunburst Background */}
              <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                   className="w-[300vmax] h-[300vmax] opacity-20 bg-[repeating-conic-gradient(from_0deg,#F59E0B_0deg_10deg,transparent_10deg_20deg)]"
                 />
              </div>

              {/* Firework Particles Effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, burstIdx) => (
                    <div key={`burst-${burstIdx}`} className="absolute" style={{ 
                        left: `${15 + Math.random() * 70}%`, 
                        top: `${15 + Math.random() * 70}%` 
                    }}>
                        {[...Array(12)].map((_, starIdx) => (
                            <motion.div
                                key={`star-${burstIdx}-${starIdx}`}
                                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                                animate={{ 
                                    scale: [0, 1.5, 0],
                                    opacity: [0, 1, 0],
                                    x: (Math.cos(starIdx * 0.52) * (80 + Math.random() * 180)),
                                    y: (Math.sin(starIdx * 0.52) * (80 + Math.random() * 180)),
                                    rotate: [0, 360]
                                }}
                                transition={{ 
                                    duration: 2.5, 
                                    repeat: Infinity,
                                    delay: burstIdx * 0.6 + starIdx * 0.03
                                }}
                                className="absolute"
                            >
                                <Sparkles className={`${['text-yellow-400', 'text-rosy', 'text-blue-400', 'text-mint'][burstIdx % 4]}`} size={16 + Math.random() * 20} />
                            </motion.div>
                        ))}
                    </div>
                ))}
              </div>

              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 15 }}
                className="relative flex flex-col items-center text-center p-8 max-w-4xl w-full z-10"
              >
                {/* Level Up Title - Thick outline matching reference */}
                <div className="relative mb-8 mt-[-5vh] w-full flex justify-center">
                    <motion.div
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex items-center justify-center space-x-3 sm:space-x-6 w-full"
                    >
                         <Sparkles size={40} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] hidden sm:block shrink-0" />
                         <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase text-yellow-400 drop-shadow-[6px_6px_0px_rgba(0,0,0,0.5)] whitespace-nowrap leading-none"
                             style={{ 
                                WebkitTextStroke: '1.5px white',
                             }}>
                            LEVEL UP!
                         </h2>
                         <Sparkles size={40} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] hidden sm:block shrink-0" />
                    </motion.div>
                </div>

                <p className="text-3xl sm:text-4xl font-black text-white mb-16 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                   恭喜 <span className="text-yellow-400 mx-2 scale-110 inline-block drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]">{levelUpInfo.studentName}</span> 的宠物升到新等级！
                </p>

                {/* Pet Showcase Container */}
                <div className="relative group">
                   {/* Dotted ring and glow effects */}
                   <motion.div 
                     animate={{ rotate: -360 }}
                     transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                     className="absolute -inset-8 border-[6px] border-dashed border-yellow-400/80 rounded-full pointer-events-none shadow-[0_0_30px_rgba(250,204,21,0.2)]"
                   />
                   <motion.div 
                     animate={{ scale: [1, 1.15, 1] }}
                     transition={{ duration: 3, repeat: Infinity }}
                     className="absolute -inset-12 bg-yellow-400/15 rounded-full blur-[60px] -z-10"
                   />

                   <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border-[12px] border-white bg-white shadow-[0_40px_100px_rgba(0,0,0,0.7)] flex items-center justify-center overflow-hidden ring-4 ring-white/20">
                      <PetDisplay pet={levelUpInfo.pet} level={levelUpInfo.level} fill={true} />
                   </div>

                   {/* Level Badge - Bottom-right red circle matching reference */}
                   <motion.div 
                     initial={{ scale: 0, x: 30, y: 30 }}
                     animate={{ scale: 1, x: 0, y: 0 }}
                     transition={{ delay: 0.6, type: "spring", damping: 12 }}
                     className="absolute -bottom-4 -right-4 sm:-bottom-8 sm:-right-8 w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-[#E94E38] border-[8px] border-white shadow-2xl flex flex-col items-center justify-center text-white z-20 shadow-red-500/30"
                   >
                     <span className="text-[14px] sm:text-xl font-black leading-none mb-1 tracking-[0.2em] opacity-90">LV.</span>
                     <span className="text-5xl sm:text-8xl font-black italic tabular-nums leading-tight">{levelUpInfo.level}</span>
                   </motion.div>
                </div>

                {/* Continue hint */}
                <div className="mt-20 sm:mt-24">
                   <motion.span 
                     animate={{ opacity: [0.3, 0.9, 0.3] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="text-white/60 font-black tracking-[0.6em] text-lg uppercase cursor-pointer block"
                   >
                     - 点击屏幕继续 -
                   </motion.span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- 盲盒关卡系统弹窗 --- */}
        <AnimatePresence>
          {isBlindBoxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] w-full max-w-lg rounded-[50px] shadow-2xl relative overflow-hidden flex flex-col p-8 sm:p-12 border-4 border-white/10">
                
                {/* 关闭入口 */}
                <button 
                  onClick={() => {
                    setIsBlindBoxOpen(false);
                    setBlindBoxResult(null);
                  }} 
                  className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors z-20"
                >
                  <X size={32} />
                </button>

                {!blindBoxResult ? (
                  <div className="flex flex-col items-center justify-center space-y-12 py-10 relative z-10">
                    <div className="relative">
                      <motion.div
                        animate={blindBoxLoading ? {
                          rotate: [0, -10, 10, -10, 10, 0],
                          scale: [1, 1.1, 1, 1.1, 1]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="text-[120px] filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] select-none cursor-default"
                      >
                        🎁
                      </motion.div>
                      {blindBoxLoading && (
                        <div className="absolute inset-x-0 -bottom-8 flex justify-center">
                          <span className="text-white/60 font-black tracking-widest animate-pulse">魔法抽取中...</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center space-y-4">
                      <h3 className="text-4xl font-black text-white italic tracking-tighter">神秘成长盲盒</h3>
                      <p className="text-white/40 font-bold max-w-xs mx-auto text-sm">
                        盲盒内含稀有宠物、炫酷皮肤或强力养成道具。<br/>每次开启消耗 <span className="text-yellow-400 font-extrabold">{BLIND_BOX_COST}</span> 积分。
                      </p>
                    </div>

                    <button
                      onClick={handleOpenBlindBox}
                      disabled={blindBoxLoading}
                      className="w-full bg-yellow-400 text-black py-6 rounded-[30px] font-black text-2xl shadow-[0_0_50px_rgba(252,211,77,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      {blindBoxLoading ? '魔法生效中...' : '消耗积分 立即开启'}
                    </button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center space-y-8 py-6 text-center relative z-10"
                  >
                    <div className="relative">
                      <motion.div 
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-yellow-400/30 blur-[120px] rounded-full" 
                      />
                      <img 
                        src={blindBoxResult.imageUrl} 
                        className="w-48 h-48 sm:w-64 sm:h-64 object-contain relative z-10 filter drop-shadow-2xl" 
                        alt={blindBoxResult.name}
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className={`inline-block px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${RARITY_CONFIG[blindBoxResult.rarity].bgColor} ${RARITY_CONFIG[blindBoxResult.rarity].color} border border-white/10`}>
                        {RARITY_CONFIG[blindBoxResult.rarity].name} 品质获得！
                      </div>
                      <h3 className="text-5xl font-black text-white tracking-tight leading-tight">{blindBoxResult.name}</h3>
                      <p className="text-white/60 font-bold max-w-xs mx-auto text-sm leading-relaxed">{blindBoxResult.description}</p>
                    </div>

                    <div className="w-full pt-6">
                      <button
                        onClick={() => {
                          setBlindBoxResult(null);
                        }}
                        className="w-full bg-white/10 text-white py-5 rounded-[30px] font-black hover:bg-white/20 transition-all border border-white/10"
                      >
                        继续开启下一个
                      </button>
                    </div>
                  </motion.div>
                )}
                
                {/* 装饰装饰装饰 */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rosy/20 rounded-full blur-[80px]" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-rosy/20 rounded-full blur-[80px]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Student Deletion Confirmation Modal */}
        <AnimatePresence>
          {classToDelete && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass max-w-sm w-full p-10 rounded-[45px] text-center space-y-8 shadow-2xl relative border-4 border-white"
              >
                <div className="w-24 h-24 bg-red-50 rounded-[40px] flex items-center justify-center mx-auto shadow-inner transform rotate-3">
                  <Trash2 size={48} className="text-red-400 blur-[0.5px]" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-gray-700 tracking-tight">真的要狠心<br/>移出该班级吗？</h3>
                  <p className="text-gray-400 font-bold px-4 leading-relaxed bg-white/40 py-4 rounded-[25px]">
                    该操作将永久删除班级及其所有关联的学生，成长记录也会随之消失哦~
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <button
                    onClick={() => removeClass(classToDelete)}
                    className="w-full bg-red-500 text-white py-5 rounded-[28px] font-black shadow-xl shadow-red-100 hover:bg-red-600 transition-all active:scale-95"
                  >
                    狠心移出
                  </button>
                  <button
                    onClick={() => setClassToDelete(null)}
                    className="w-full py-4 text-[#94A3B8] font-bold hover:text-[#2D4256] transition-colors"
                  >
                    留它在这
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {studentToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[45px] p-10 max-w-sm w-full shadow-2xl relative overflow-hidden text-center space-y-6"
              >
                <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center text-red-500 mx-auto">
                  <AlertTriangle size={40} />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-[#2D4256] mb-2 font-display">移出小镇提醒</h3>
                   <p className="text-gray-400 font-bold leading-relaxed px-2">
                     确定要将 <span className="text-red-500 font-black">"{studentToDelete.name}"</span> 移出小镇吗？相关联的积分和记录也将不再可见，该操作无法撤销！
                   </p>
                </div>
                <div className="flex flex-col space-y-3 pt-4">
                  <button
                    onClick={() => {
                      removeStudent(studentToDelete.id);
                      setStudentToDelete(null);
                    }}
                    className="w-full bg-red-500 text-white py-5 rounded-[28px] font-black shadow-xl shadow-red-100 hover:bg-red-600 transition-all active:scale-95"
                  >
                    狠心移出
                  </button>
                  <button
                    onClick={() => setStudentToDelete(null)}
                    className="w-full py-4 text-[#94A3B8] font-bold hover:text-[#2D4256] transition-colors"
                  >
                    留它在这
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>


  </div>
);
}

