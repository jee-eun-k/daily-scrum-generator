'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { TaskItem } from '@/components/TaskItem';
import { Toaster } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';
import { DailyScrumApi, ScrumData, ScrumEntry } from '@/lib/api';

// Use ScrumEntry as our task type
type ExtendedTask = ScrumEntry;

export const DailyScrumGenerator = () => {
	// State for user identification
	const [userId, setUserId] = useState('');
	const [isLoadingData, setIsLoadingData] = useState(false);

	// State for tasks in each section
	const [yesterdayTasks, setYesterdayTasks] = useState<ExtendedTask[]>([]);
	const [todayTasks, setTodayTasks] = useState<ExtendedTask[]>([]);
	const [impedimentTasks, setImpedimentTasks] = useState<ExtendedTask[]>([]);
	const [laterTasks, setLaterTasks] = useState<ExtendedTask[]>([]);

	const [generatedScrum, setGeneratedScrum] = useState('');
	const { toasts, showToast } = useToast();

	// State to keep track of data loading
	const [isReady] = useState(true);

	// State to keep track of the dragged item
	const [draggedItem, setDraggedItem] = useState<{ id: string; section: string } | null>(
		null
	);

	// Helper function to check if weekly tasks should be auto-inserted
	const getWeeklyTasks = useCallback(() => {
		const today = new Date();
		const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
		const weeklyTasks: ExtendedTask[] = [];

		// Wednesday (day 3): Add "Write weekly report" to Today section
		if (dayOfWeek === 3) {
			weeklyTasks.push({
				id: 'weekly-report-' + crypto.randomUUID(),
				text: '주간 리포트 작성',
				isAutoInserted: true
			});
		}

		// Thursday (day 4): Add "Weekly report meeting" to Today section
		if (dayOfWeek === 4) {
			weeklyTasks.push({
				id: 'weekly-meeting-' + crypto.randomUUID(),
				text: '주간 리포트 미팅',
				isAutoInserted: true
			});
		}

		return weeklyTasks;
	}, []);

	// Auto-insert weekly tasks when component mounts or date changes
	useEffect(() => {
		const weeklyTasks = getWeeklyTasks();
		if (weeklyTasks.length > 0) {
			// Check if weekly tasks are already added to avoid duplicates
			const hasAutoTasks = todayTasks.some(task => task.isAutoInserted);
			if (!hasAutoTasks) {
				setTodayTasks(prev => [...prev, ...weeklyTasks]);
				const taskNames = weeklyTasks.map(t => t.text).join(', ');
				showToast(
					'주간 업무 자동 추가',
					`오늘의 주간 업무가 자동으로 추가되었습니다: ${taskNames}`,
					'default'
				);
			}
		}
	}, [getWeeklyTasks, todayTasks, showToast]);

	// Helper to get the correct setter function for a section
	const getSetFunction = useCallback((section: string) => {
		if (section === 'yesterday') return setYesterdayTasks;
		if (section === 'today') return setTodayTasks;
		if (section === 'impediments') return setImpedimentTasks;
		if (section === 'later') return setLaterTasks;
		return null;
	}, []);

	// Helper to get the correct tasks array for a section
	const getTasksArray = useCallback(
		(section: string) => {
			if (section === 'yesterday') return yesterdayTasks;
			if (section === 'today') return todayTasks;
			if (section === 'impediments') return impedimentTasks;
			if (section === 'later') return laterTasks;
			return [];
		},
		[yesterdayTasks, todayTasks, impedimentTasks, laterTasks]
	);

	// Load data from localStorage on component mount
	useEffect(() => {
		const loadData = () => {
			try {
				const savedData = localStorage.getItem('scrumData');
				if (savedData) {
					const data = JSON.parse(savedData);
					setUserId(data.userId || '');
					setYesterdayTasks(data.yesterday || []);
					setTodayTasks(data.today || []);
					setImpedimentTasks(data.impediments || []);
					setLaterTasks(data.later || []);
					if (
						data.yesterday?.length > 0 ||
						data.today?.length > 0 ||
						data.impediments?.length > 0 ||
						data.later?.length > 0
					) {
						showToast(
							'데이터 불러오기 완료',
							'이전 스크럼 데이터가 로드되었습니다.',
							'success'
						);
					}
				}
			} catch (error) {
				console.error('Error loading data from localStorage:', error);
			}
		};

		loadData();
	}, [showToast]);


	// Save data to API and localStorage (debounced)
	useEffect(() => {
		if (!isReady || !userId.trim()) return;

		const handler = setTimeout(async () => {
			try {
				// Save to localStorage for backup
				const localData = {
					userId,
					yesterday: yesterdayTasks,
					today: todayTasks,
					impediments: impedimentTasks,
					later: laterTasks,
				};
				localStorage.setItem('scrumData', JSON.stringify(localData));

				// Save to API if user ID is provided
				const scrumData: ScrumData = {
					yesterday: yesterdayTasks,
					today: todayTasks,
					impediments: impedimentTasks,
					later: laterTasks
				};
				
				await DailyScrumApi.saveUserData(userId, scrumData);
			} catch (error) {
				console.error('Error saving data:', error);
				showToast(
					'자동 저장 실패',
					'스크럼 데이터 저장 중 오류가 발생했습니다.',
					'error'
				);
			}
		}, 1000); // Debounce by 1 second

		return () => clearTimeout(handler);
	}, [userId, yesterdayTasks, todayTasks, impedimentTasks, laterTasks, isReady, showToast]);

	// Add a new empty task to a specific section
	const addTask = useCallback(
		(section: string) => {
			const newTask: ExtendedTask = { id: crypto.randomUUID(), text: '' };
			const setFunction = getSetFunction(section);
			if (setFunction) {
				setFunction((prevTasks) => [...prevTasks, newTask]);
				showToast('태스크 추가됨', '새 태스크가 추가되었습니다.', 'default');
			}
		},
		[getSetFunction, showToast]
	);

	// Remove a task by its ID from a specific section
	const removeTask = useCallback(
		(section: string, id: string) => {
			const setFunction = getSetFunction(section);
			if (setFunction) {
				setFunction((prevTasks) => prevTasks.filter((task) => task.id !== id));
				showToast('태스크 삭제됨', '태스크가 삭제되었습니다.', 'default');
			}
		},
		[getSetFunction, showToast]
	);

	// Update the text of a specific task in a specific section
	const updateTaskText = useCallback(
		(section: string, id: string, newText: string) => {
			const setFunction = getSetFunction(section);
			if (setFunction) {
				setFunction((prevTasks) =>
					prevTasks.map((task) => (task.id === id ? { ...task, text: newText } : task))
				);
			}
		},
		[getSetFunction]
	);

	// Update the work item ID of a specific task in a specific section
	const updateTaskWorkItemId = useCallback(
		(section: string, id: string, workItemId: string) => {
			const setFunction = getSetFunction(section);
			if (setFunction) {
				setFunction((prevTasks) =>
					prevTasks.map((task) => (task.id === id ? { ...task, workItemId } : task))
				);
			}
		},
		[getSetFunction]
	);

	// Drag and Drop Handlers
	const handleDragStart = useCallback(
		(e: React.DragEvent, section: string, id: string) => {
			setDraggedItem({ id, section });
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', JSON.stringify({ id, section }));
		},
		[]
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent, targetSection: string, targetId?: string) => {
			e.preventDefault();

			if (!draggedItem) {
				return;
			}

			const sourceId = draggedItem.id;
			const sourceSection = draggedItem.section;

			// If dragging within the same section, handle reordering
			if (sourceSection === targetSection) {
				const tasks = getTasksArray(sourceSection);
				const setFunction = getSetFunction(sourceSection);

				const sourceIndex = tasks.findIndex((task) => task.id === sourceId);
				if (sourceIndex === -1) return;

				const updatedTasks = [...tasks];
				const [movedItem] = updatedTasks.splice(sourceIndex, 1);

				if (targetId === undefined) {
					updatedTasks.push(movedItem);
				} else {
					const targetIndex = updatedTasks.findIndex((task) => task.id === targetId);
					if (targetIndex === -1) return;

					updatedTasks.splice(targetIndex, 0, movedItem);
				}

				if (setFunction) {
					setFunction(updatedTasks);
				}
			} else {
				// Handle cross-section drag and drop
				const sourceTasks = getTasksArray(sourceSection);
				const targetTasks = getTasksArray(targetSection);
				const sourceSetFunction = getSetFunction(sourceSection);
				const targetSetFunction = getSetFunction(targetSection);

				const sourceIndex = sourceTasks.findIndex((task) => task.id === sourceId);
				if (sourceIndex === -1) return;

				const movedItem = sourceTasks[sourceIndex];

				// Remove from source section
				const updatedSourceTasks = sourceTasks.filter((task) => task.id !== sourceId);
				if (sourceSetFunction) {
					sourceSetFunction(updatedSourceTasks);
				}

				// Add to target section
				const updatedTargetTasks = [...targetTasks];
				if (targetId === undefined) {
					updatedTargetTasks.push(movedItem);
				} else {
					const targetIndex = updatedTargetTasks.findIndex((task) => task.id === targetId);
					if (targetIndex === -1) {
						updatedTargetTasks.push(movedItem);
					} else {
						updatedTargetTasks.splice(targetIndex, 0, movedItem);
					}
				}

				if (targetSetFunction) {
					targetSetFunction(updatedTargetTasks);
				}
			}

			setDraggedItem(null);
			showToast('태스크 이동 완료!', '태스크 위치가 변경되었습니다.', 'default');
		},
		[draggedItem, getTasksArray, getSetFunction, showToast]
	);

	// Load previous data from API
	const loadPreviousData = useCallback(async () => {
		if (!userId.trim()) {
			showToast('사용자 ID 필요', '사용자 ID를 입력해주세요.', 'error');
			return;
		}

		setIsLoadingData(true);
		try {
			// Try to load user's current data first
			const currentData = await DailyScrumApi.loadUserData(userId);
			
			// Check if user has any current data
			const hasCurrentData = Object.values(currentData).some(tasks => tasks.length > 0);
			
			if (hasCurrentData) {
				// Load current day's data
				setYesterdayTasks(currentData.yesterday);
				setTodayTasks(currentData.today);
				setImpedimentTasks(currentData.impediments);
				setLaterTasks(currentData.later);
				showToast('데이터 로드 완료', `${userId}의 오늘 데이터를 로드했습니다.`, 'success');
			} else {
				// Try to load previous day's data
				try {
					const previousData = await DailyScrumApi.loadPreviousData(userId);
					
					// Move previous "today" tasks to "yesterday"
					setYesterdayTasks(previousData.today);
					setTodayTasks([]);
					setImpedimentTasks([]);
					setLaterTasks(previousData.later); // Keep later tasks
					
					if (previousData.today.length > 0) {
						showToast('이전 데이터 적용', `${userId}의 이전 "오늘 할 일"이 "어제 한 일"로 이동되었습니다.`, 'success');
					} else {
						showToast('데이터 없음', `${userId}에 대한 이전 데이터를 찾을 수 없습니다.`, 'default');
					}
				} catch {
					showToast('새 사용자', `${userId}를 위한 새 스크럼을 시작합니다.`, 'default');
				}
			}
		} catch (error) {
			console.error('Error loading data:', error);
			showToast('데이터 로드 실패', '데이터를 불러오는 중 오류가 발생했습니다.', 'error');
		} finally {
			setIsLoadingData(false);
		}
	}, [userId, showToast]);

	// Clear all data
	const clearAllData = useCallback(() => {
		setYesterdayTasks([]);
		setTodayTasks([]);
		setImpedimentTasks([]);
		setLaterTasks([]);
		setGeneratedScrum('');
		showToast('모두 지움', '모든 스크럼 데이터가 지워졌습니다.', 'default');
	}, [showToast]);

	// Helper function to format task with work item link
	const formatTaskWithLink = useCallback((task: ExtendedTask) => {
		const trimmedText = task.text.trim();
		if (!trimmedText) return '';
		
		const autoIndicator = task.isAutoInserted ? ' (auto-inserted)' : '';
		if (task.workItemId?.trim()) {
			const workItemLink = `https://dev.azure.com/pmi-ap/General/_workitems/edit/${task.workItemId.trim()}`;
			return `- ${trimmedText} [WI#${task.workItemId}](${workItemLink})${autoIndicator}`;
		} else {
			return `- ${trimmedText}${autoIndicator}`;
		}
	}, []);

	// Function to generate the scrum update with enhanced format
	const generateScrum = useCallback(() => {
		const currentDate = new Date();
		// Format: YYYY-MM-DD
		const dateString = currentDate.toISOString().split('T')[0];
		
		// User ID display (fallback to 'Anonymous' if empty)
		const displayUserId = userId.trim() || 'Anonymous';

		let scrumText = `📅 ${dateString} Daily Scrum - [${displayUserId}]\n\n`;

		if (yesterdayTasks.length > 0) {
			scrumText += '✅ Yesterday:\n';
			yesterdayTasks.forEach((task) => {
				const formattedTask = formatTaskWithLink(task);
				if (formattedTask) {
					scrumText += `${formattedTask}\n`;
				}
			});
			scrumText += '\n';
		}

		if (todayTasks.length > 0) {
			scrumText += '📋 Today:\n';
			todayTasks.forEach((task) => {
				const formattedTask = formatTaskWithLink(task);
				if (formattedTask) {
					scrumText += `${formattedTask}\n`;
				}
			});
			scrumText += '\n';
		}

		if (impedimentTasks.length > 0) {
			scrumText += '🚫 Blockers:\n';
			impedimentTasks.forEach((task) => {
				const formattedTask = formatTaskWithLink(task);
				if (formattedTask) {
					scrumText += `${formattedTask}\n`;
				}
			});
			scrumText += '\n';
		}

		if (laterTasks.length > 0) {
			scrumText += '📝 Later:\n';
			laterTasks.forEach((task) => {
				const formattedTask = formatTaskWithLink(task);
				if (formattedTask) {
					scrumText += `${formattedTask}\n`;
				}
			});
			scrumText += '\n';
		}

		if (
			yesterdayTasks.length === 0 &&
			todayTasks.length === 0 &&
			impedimentTasks.length === 0 &&
			laterTasks.length === 0
		) {
			scrumText = `📅 ${dateString} Daily Scrum - [${displayUserId}]\n\n스크럼 업데이트를 생성하려면 세부 정보를 입력해주세요.`;
		}

		setGeneratedScrum(scrumText.trim());
		showToast('스크럼 생성 완료!', '일일 스크럼 업데이트가 준비되었습니다.', 'success');
	}, [userId, yesterdayTasks, todayTasks, impedimentTasks, laterTasks, formatTaskWithLink, showToast]);

	// Function to copy text to clipboard
	const copyToClipboard = useCallback(async () => {
		if (generatedScrum) {
			try {
				await navigator.clipboard.writeText(generatedScrum);
				showToast(
					'복사 완료!',
					'스크럼 업데이트가 클립보드에 복사되었습니다.',
					'default'
				);
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (_err) {
				// Fallback for older browsers
				const textarea = document.createElement('textarea');
				textarea.value = generatedScrum;
				textarea.style.position = 'fixed';
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand('copy');
				document.body.removeChild(textarea);
				showToast(
					'복사 완료!',
					'스크럼 업데이트가 클립보드에 복사되었습니다.',
					'default'
				);
			}
		} else {
			showToast('복사할 내용 없음', '먼저 스크럼 업데이트를 생성해주세요!', 'error');
		}
	}, [generatedScrum, showToast]);

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4'>
			<Card className='w-full max-w-2xl mx-auto rounded-xl shadow-lg'>
				<CardHeader>
					<CardTitle>일일 스크럼 생성기</CardTitle>
					<CardDescription>빠르게 일일 스크럼 업데이트를 생성하세요.</CardDescription>
				</CardHeader>
				<CardContent className='grid gap-6'>
					{/* 사용자 ID 입력 섹션 */}
					<div className='grid gap-2'>
						<Label htmlFor='user-id'>사용자 ID:</Label>
						<div className='flex gap-2'>
							<div className='relative flex-1'>
								<User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
								<Input
									id='user-id'
									type='text'
									placeholder='사용자 ID를 입력하세요'
									value={userId}
									onChange={(e) => setUserId(e.target.value)}
									className='pl-10'
								/>
							</div>
							<Button
								onClick={loadPreviousData}
								disabled={!userId.trim() || isLoadingData}
								variant='outline'
							>
								{isLoadingData ? '로딩중...' : '이전 데이터 불러오기'}
							</Button>
						</div>
					</div>
	
					{/* 어제 한 일 섹션 */}
					<div
						className='grid gap-2'
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, 'yesterday')}
					>
						<div className='flex items-center justify-between'>
							<Label htmlFor='yesterday-tasks'>어제 한 일:</Label>
							<Button
								onClick={() => addTask('yesterday')}
								variant='ghost'
								size='sm'
								className='h-6 px-2 text-xs text-gray-500 hover:text-gray-700'
							>
								<Plus className='h-3 w-3 mr-1' />
								추가
							</Button>
						</div>
						{yesterdayTasks.map((task) => (
							<TaskItem
								key={task.id}
								task={task}
								section='yesterday'
								onUpdateText={updateTaskText}
								onUpdateWorkItemId={updateTaskWorkItemId}
								onRemove={removeTask}
								onDragStart={handleDragStart}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
							/>
						))}
					</div>

					{/* 오늘 할 일 섹션 */}
					<div
						className='grid gap-2'
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, 'today')}
					>
						<div className='flex items-center justify-between'>
							<Label htmlFor='today-tasks'>오늘 할 일:</Label>
							<Button
								onClick={() => addTask('today')}
								variant='ghost'
								size='sm'
								className='h-6 px-2 text-xs text-gray-500 hover:text-gray-700'
							>
								<Plus className='h-3 w-3 mr-1' />
								추가
							</Button>
						</div>
						{todayTasks.map((task) => (
							<TaskItem
								key={task.id}
								task={task}
								section='today'
								onUpdateText={updateTaskText}
								onUpdateWorkItemId={updateTaskWorkItemId}
								onRemove={removeTask}
								onDragStart={handleDragStart}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
							/>
						))}
					</div>

					{/* 방해 요소 섹션 */}
					<div
						className='grid gap-2'
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, 'impediments')}
					>
						<div className='flex items-center justify-between'>
							<Label htmlFor='impediments-tasks'>방해 요소:</Label>
							<Button
								onClick={() => addTask('impediments')}
								variant='ghost'
								size='sm'
								className='h-6 px-2 text-xs text-gray-500 hover:text-gray-700'
							>
								<Plus className='h-3 w-3 mr-1' />
								추가
							</Button>
						</div>
						{impedimentTasks.map((task) => (
							<TaskItem
								key={task.id}
								task={task}
								section='impediments'
								onUpdateText={updateTaskText}
								onUpdateWorkItemId={updateTaskWorkItemId}
								onRemove={removeTask}
								onDragStart={handleDragStart}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
							/>
						))}
					</div>

					{/* 나중에 할 일 섹션 */}
					<div
						className='grid gap-2'
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, 'later')}
					>
						<div className='flex items-center justify-between'>
							<Label htmlFor='later-tasks'>나중에 할 일:</Label>
							<Button
								onClick={() => addTask('later')}
								variant='ghost'
								size='sm'
								className='h-6 px-2 text-xs text-gray-500 hover:text-gray-700'
							>
								<Plus className='h-3 w-3 mr-1' />
								추가
							</Button>
						</div>
						{laterTasks.map((task) => (
							<TaskItem
								key={task.id}
								task={task}
								section='later'
								onUpdateText={updateTaskText}
								onUpdateWorkItemId={updateTaskWorkItemId}
								onRemove={removeTask}
								onDragStart={handleDragStart}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
							/>
						))}
					</div>

					<div className='flex gap-2 mt-4'>
						<Button onClick={clearAllData} variant='outline' className='flex-1'>
							모두 지우기
						</Button>
					</div>

					<Button onClick={generateScrum} className='w-full mt-4'>
						스크럼 생성
					</Button>
				</CardContent>
				{generatedScrum && (
					<CardFooter className='flex flex-col items-start gap-4'>
						<div className='w-full'>
							<Label>일일 스크럼 업데이트 (클릭해서 복사):</Label>
							<div className='relative mt-2 p-4 bg-muted rounded-md border border-border text-sm whitespace-pre-wrap font-mono'>
								{generatedScrum}
								<Button
									variant='ghost'
									size='icon'
									className='absolute top-2 right-2 hover:bg-accent'
									onClick={copyToClipboard}
									title='클립보드에 복사'
								>
									<Copy className='h-4 w-4' />
								</Button>
							</div>
						</div>
					</CardFooter>
				)}
			</Card>
			<Toaster toasts={toasts} />
		</div>
	);
};
