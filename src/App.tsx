import { useState, useRef } from 'react'
import { Tldraw, Editor } from 'tldraw'
import { GoogleGenerativeAI } from '@google/generative-ai'
import './App.css'

type TabType = 'moodboard' | 'design'

function App() {
	const [activeTab, setActiveTab] = useState<TabType>('moodboard')
	
	// 무드보드 탭 상태
	const moodboardEditorRef = useRef<Editor | null>(null)
	
	// 디자인 탭 상태
	const designEditorRef = useRef<Editor | null>(null)
	const [showSubButtons, setShowSubButtons] = useState(false)
	const [showStrapModal, setShowStrapModal] = useState(false)
	const [showAccessoryModal, setShowAccessoryModal] = useState(false)
	const [showColorModal, setShowColorModal] = useState(false)
	const [showLeatherModal, setShowLeatherModal] = useState(false)
	const [selectedColor, setSelectedColor] = useState<string>('')
	const [selectedLeather, setSelectedLeather] = useState<string>('')
	const [isLoading, setIsLoading] = useState(false)
	const [loadingProgress, setLoadingProgress] = useState(0)

	return (
		<div className="app">
			<div className="header">
				<h1 className="title">CUSMESTUDIO</h1>
				<div className="tabs">
					<button 
						className={`tab ${activeTab === 'moodboard' ? 'active' : ''}`}
						onClick={() => setActiveTab('moodboard')}
					>
						무드보드
					</button>
					<button 
						className={`tab ${activeTab === 'design' ? 'active' : ''}`}
						onClick={() => setActiveTab('design')}
					>
						디자인
					</button>
				</div>
			</div>
			<div className="content">
				<div style={{ display: activeTab === 'moodboard' ? 'block' : 'none' }}>
					<MoodboardTab 
						editorRef={moodboardEditorRef}
					/>
				</div>
				<div style={{ display: activeTab === 'design' ? 'block' : 'none' }}>
					<DesignTab 
						editorRef={designEditorRef}
						showSubButtons={showSubButtons}
						setShowSubButtons={setShowSubButtons}
						showStrapModal={showStrapModal}
						setShowStrapModal={setShowStrapModal}
						showAccessoryModal={showAccessoryModal}
						setShowAccessoryModal={setShowAccessoryModal}
						showColorModal={showColorModal}
						setShowColorModal={setShowColorModal}
						showLeatherModal={showLeatherModal}
						setShowLeatherModal={setShowLeatherModal}
						selectedColor={selectedColor}
						setSelectedColor={setSelectedColor}
						selectedLeather={selectedLeather}
						setSelectedLeather={setSelectedLeather}
						isLoading={isLoading}
						setIsLoading={setIsLoading}
						loadingProgress={loadingProgress}
						setLoadingProgress={setLoadingProgress}
					/>
				</div>
			</div>
		</div>
	)
}

interface MoodboardTabProps {
	editorRef: React.MutableRefObject<Editor | null>
}

function MoodboardTab({ editorRef }: MoodboardTabProps) {
	const handleEditorMount = (editor: Editor) => {
		if (editorRef.current !== editor) {
			editorRef.current = editor
		}
		// 무드보드 진입 시 템플릿 구역 생성 (한 번만)
		const shapes = editor.getCurrentPageShapes()
		if (shapes.length === 0) {
			createMoodboardTemplate(editor)
		}
	}

	const createMoodboardTemplate = (editor: Editor) => {
		// 화이트보드 크기 기준으로 계산 (일반적인 화이트보드 크기: 1200x800)
		const boardWidth = 1200
		const boardHeight = 800
		const totalArea = boardWidth * boardHeight
		const rectArea = totalArea / 6  // 화이트보드의 1/6 면적
		
		// 2행 3열 배치를 위한 사각형 크기 계산
		const rectWidth = Math.sqrt(rectArea * 3 / 2)  // 가로 비율 고려
		const rectHeight = rectArea / rectWidth
		

		// 6개 사각형 생성 (2행 3열)
		const shapes = []
		const margin = 20  // 사각형 간 간격
		const startX = 50  // 좌측 여백
		const startY = 50  // 상단 여백
		
		for (let i = 0; i < 6; i++) {
			const row = Math.floor(i / 3)
			const col = i % 3
			const x = startX + col * (rectWidth + margin)
			const y = startY + row * (rectHeight + margin)
			
			// 사각형 생성 (배경색 추가)
			shapes.push({
				type: 'geo',
				x: x,
				y: y,
				props: {
					geo: 'rectangle',
					w: rectWidth,
					h: rectHeight,
					fill: 'semi',
					color: 'grey',
					size: 'm'
				}
			})
			
			// 텍스트 영역을 위한 작은 사각형 (상단 중앙)
			shapes.push({
				type: 'geo',
				x: x + rectWidth / 2 - 100,
				y: y + 20,
				props: {
					geo: 'rectangle',
					w: 200,
					h: 40,
					fill: 'solid',
					color: 'white',
					size: 's'
				}
			})
			
			// 카테고리 텍스트 추가 (상단 중앙 사각형 안에)
			shapes.push({
				type: 'text',
				x: x + rectWidth / 2 - 90,
				y: y + 30,
				props: {
					size: 'm',
					color: 'black',
					font: 'draw'
				}
			})
		}
		
		editor.createShapes(shapes)
	}

	return (
		<div className="moodboard-container">
			<Tldraw 
			onMount={handleEditorMount}
			licenseKey='tldraw-2026-01-04/WyJqWXh1VkZQTCIsWyIqIl0sMTYsIjIwMjYtMDEtMDQiXQ.DOPgWWJU87W+Pu4Ug4M+OfNVXPvLCQjpM35TLM2LaBgqSQMZd9VYCGR22b12N/aIs/Boj2IuoHQlRseuRQmF/w'
			/>
		</div>
	)
}

interface DesignTabProps {
	editorRef: React.MutableRefObject<Editor | null>
	showSubButtons: boolean
	setShowSubButtons: (value: boolean) => void
	showStrapModal: boolean
	setShowStrapModal: (value: boolean) => void
	showAccessoryModal: boolean
	setShowAccessoryModal: (value: boolean) => void
	showColorModal: boolean
	setShowColorModal: (value: boolean) => void
	showLeatherModal: boolean
	setShowLeatherModal: (value: boolean) => void
	selectedColor: string
	setSelectedColor: (value: string) => void
	selectedLeather: string
	setSelectedLeather: (value: string) => void
	isLoading: boolean
	setIsLoading: (value: boolean) => void
	loadingProgress: number
	setLoadingProgress: (value: number | ((prev: number) => number)) => void
}

function DesignTab({
	editorRef,
	showSubButtons,
	setShowSubButtons,
	showStrapModal,
	setShowStrapModal,
	showAccessoryModal,
	setShowAccessoryModal,
	showColorModal,
	setShowColorModal,
	showLeatherModal,
	setShowLeatherModal,
	selectedColor,
	setSelectedColor,
	selectedLeather,
	setSelectedLeather,
	isLoading,
	setIsLoading,
	loadingProgress,
	setLoadingProgress
}: DesignTabProps) {

	const handleEditorMount = (editor: Editor) => {
		if (editorRef.current !== editor) {
			editorRef.current = editor
		}
	}

	const handleBaseClick = () => {
		setShowSubButtons(!showSubButtons)
		setShowStrapModal(false) // 다른 모달 닫기
		setShowAccessoryModal(false) // 다른 모달 닫기
		setShowColorModal(false) // 다른 모달 닫기
		setShowLeatherModal(false) // 다른 모달 닫기
	}

	const handleStrapClick = () => {
		setShowStrapModal(!showStrapModal)
		setShowSubButtons(false) // 다른 모달 닫기
		setShowAccessoryModal(false) // 다른 모달 닫기
		setShowColorModal(false) // 다른 모달 닫기
		setShowLeatherModal(false) // 다른 모달 닫기
	}

	const handleAccessoryClick = () => {
		setShowAccessoryModal(!showAccessoryModal)
		setShowSubButtons(false) // 다른 모달 닫기
		setShowStrapModal(false) // 다른 모달 닫기
		setShowColorModal(false) // 다른 모달 닫기
		setShowLeatherModal(false) // 다른 모달 닫기
	}

	const handleColorClick = () => {
		setShowColorModal(!showColorModal)
		setShowSubButtons(false) // 다른 모달 닫기
		setShowStrapModal(false) // 다른 모달 닫기
		setShowAccessoryModal(false) // 다른 모달 닫기
		setShowLeatherModal(false) // 다른 모달 닫기
	}

	const handleColorSelect = (colorHex: string) => {
		setSelectedColor(colorHex)
		setShowColorModal(false)
	}

	const handleLeatherClick = () => {
		setShowLeatherModal(!showLeatherModal)
		setShowSubButtons(false) // 다른 모달 닫기
		setShowStrapModal(false) // 다른 모달 닫기
		setShowAccessoryModal(false) // 다른 모달 닫기
		setShowColorModal(false) // 다른 모달 닫기
	}

	const handleLeatherSelect = (leatherName: string) => {
		setSelectedLeather(leatherName)
		setShowLeatherModal(false)
	}

	const loadSketchTemplate = async (type: 'loafer' | 'heel') => {
		if (!editorRef.current) return

		const imageUrl = type === 'loafer' 
			? `${window.location.origin}/loafer.JPG`
			: `${window.location.origin}/heel.JPG`

		try {
			// TLImageAsset 구조에 맞는 에셋 생성
			const imageAsset = {
				id: `asset:${type}-${Date.now()}` as any,
				typeName: 'asset' as const,
				type: 'image' as const,
				props: {
					src: imageUrl,
					w: 300,
					h: 200,
					mimeType: 'image/jpeg',
					isAnimated: false,
					name: `${type}.JPG`
				},
				meta: {}
			}

			// 에셋을 에디터에 추가
			await editorRef.current.createAssets([imageAsset])
			const asset = imageAsset

			console.log('에셋 생성 완료:', asset)

			// 편집 가능한 이미지 도형 생성
			const imageShape = {
				type: 'image' as const,
				x: 200,
				y: 200,
				props: {
					assetId: asset.id,
					w: 300,
					h: 200
				}
			}

			// 에디터에 이미지 도형 추가
			const createdShapes = editorRef.current.createShapes([imageShape])
			
			console.log('이미지 도형 생성 완료:', createdShapes)
			console.log('현재 페이지 도형들:', editorRef.current.getCurrentPageShapes())
			
			// 생성된 이미지로 카메라 이동
			editorRef.current.setCamera({ x: 0, y: 0, z: 1.5 })
		} catch (error) {
			console.error('이미지 로드 실패:', error)
		}
	}

	const loadStrapImage = async () => {
		if (!editorRef.current) return

		const imageUrl = `${window.location.origin}/strap1.png`

		try {
			// TLImageAsset 구조에 맞는 에셋 생성
			const imageAsset = {
				id: `asset:strap-${Date.now()}` as any,
				typeName: 'asset' as const,
				type: 'image' as const,
				props: {
					src: imageUrl,
					w: 300,
					h: 200,
					mimeType: 'image/png',
					isAnimated: false,
					name: 'strap1.png'
				},
				meta: {}
			}

			// 에셋을 에디터에 추가
			await editorRef.current.createAssets([imageAsset])
			const asset = imageAsset

			console.log('스트랩 에셋 생성 완료:', asset)

			// 편집 가능한 이미지 도형 생성
			const imageShape = {
				type: 'image' as const,
				x: 200,
				y: 200,
				props: {
					assetId: asset.id,
					w: 300,
					h: 200
				}
			}

			// 에디터에 이미지 도형 추가
			const createdShapes = editorRef.current.createShapes([imageShape])
			
			console.log('스트랩 이미지 도형 생성 완료:', createdShapes)
			console.log('현재 페이지 도형들:', editorRef.current.getCurrentPageShapes())
			
			// 생성된 이미지로 카메라 이동
			editorRef.current.setCamera({ x: 0, y: 0, z: 1.5 })
		} catch (error) {
			console.error('스트랩 이미지 로드 실패:', error)
		}
	}

	const loadAccessoryImage = async (buttonType: 'button1' | 'button2') => {
		if (!editorRef.current) return

		const imageUrl = `${window.location.origin}/${buttonType}.png`

		try {
			// TLImageAsset 구조에 맞는 에셋 생성
			const imageAsset = {
				id: `asset:${buttonType}-${Date.now()}` as any,
				typeName: 'asset' as const,
				type: 'image' as const,
				props: {
					src: imageUrl,
					w: 300,
					h: 200,
					mimeType: 'image/png',
					isAnimated: false,
					name: `${buttonType}.png`
				},
				meta: {}
			}

			// 에셋을 에디터에 추가
			await editorRef.current.createAssets([imageAsset])
			const asset = imageAsset

			console.log('부자재 에셋 생성 완료:', asset)

			// 편집 가능한 이미지 도형 생성
			const imageShape = {
				type: 'image' as const,
				x: 200,
				y: 200,
				props: {
					assetId: asset.id,
					w: 300,
					h: 200
				}
			}

			// 에디터에 이미지 도형 추가
			const createdShapes = editorRef.current.createShapes([imageShape])
			
			console.log('부자재 이미지 도형 생성 완료:', createdShapes)
			console.log('현재 페이지 도형들:', editorRef.current.getCurrentPageShapes())
			
			// 생성된 이미지로 카메라 이동
			editorRef.current.setCamera({ x: 0, y: 0, z: 1.5 })
		} catch (error) {
			console.error('부자재 이미지 로드 실패:', error)
		}
	}

	const exportCanvasAsImage = async () => {
		if (!editorRef.current) return

		try {
			// 현재 페이지의 모든 도형 가져오기
			const allShapes = editorRef.current.getCurrentPageShapes()
			
			if (allShapes.length === 0) {
				alert('화이트보드에 이미지가 없습니다.')
				return
			}

			// 프레임이 있는지 확인
			const frames = allShapes.filter(shape => shape.type === 'frame')
			
			let shapesToExport = allShapes
			
			// 프레임이 있다면, 프레임 안에 있는 shape들만 가져오기
			if (frames.length > 0) {
				// 첫 번째 프레임 (스케치영역)에 있는 shape들만 필터링
				const sketchFrame = frames[0]
				
				// 프레임 안에 있는 shape들 가져오기 (parentId가 프레임 id인 것들)
				const frameShapes = allShapes.filter(shape => 
					shape.parentId === sketchFrame.id && shape.type !== 'frame'
				)
				
				console.log('프레임 감지됨')
				console.log('프레임 ID:', sketchFrame.id)
				console.log('프레임 안의 shape 개수:', frameShapes.length)
				console.log('프레임 안의 shapes:', frameShapes)
				
				if (frameShapes.length === 0) {
					alert('프레임 안에 이미지가 없습니다.')
					return
				}
				
				shapesToExport = frameShapes
			} else {
				console.log('프레임이 없어서 전체 화면의 shape들을 사용합니다.')
			}
			
			// 선택된 shape들을 이미지로 추출하기
			const image = await editorRef.current.toImageDataUrl(shapesToExport)
			console.log(image.url)
			
			// AI로 이미지 변환
			const leatherImageUrl = selectedLeather ? `${window.location.origin}/${selectedLeather}.jpeg` : undefined
			await transformImageWithAI(image.url, leatherImageUrl)
			
		} catch (error) {
			console.error('이미지 내보내기 실패:', error)
			alert('이미지 내보내기에 실패했습니다.')
		}
	}

	const transformImageWithAI = async (imageDataUrl: string, leatherImageUrl?: string) => {
		let progressInterval: number | undefined
		
		try {
			// 로딩 시작
			setIsLoading(true)
			setLoadingProgress(0)
			
			// 진행률 시뮬레이션
			progressInterval = setInterval(() => {
				setLoadingProgress(prev => {
					if (prev >= 90) return prev
					return prev + Math.random() * 10
				})
			}, 200)

			// Gemini API 키 (환경 변수에서 가져오거나 직접 설정)
			const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyA7Czs8HbA-Hud1Zmyhe08vQr62gYjL0FU'
			
			if (API_KEY !== 'AIzaSyA7Czs8HbA-Hud1Zmyhe08vQr62gYjL0FU') {
				clearInterval(progressInterval)
				setIsLoading(false)
				alert('Gemini API 키를 설정해주세요.\n\n방법 1: .env 파일에 VITE_GEMINI_API_KEY=your_api_key 추가\n방법 2: 코드에서 직접 API_KEY 변수 수정')
				return
			}

			setLoadingProgress(20)
			const genAI = new GoogleGenerativeAI(API_KEY)
			
			setLoadingProgress(40)
			// 이미지 데이터를 base64로 변환
			const base64Data = imageDataUrl.split(',')[1]
			
			setLoadingProgress(60)
			// Gemini에 이미지와 프롬프트 전송 (할당량이 더 많은 모델 사용)
			const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" })
			
			const colorPrompt = selectedColor ? ` with the color ${selectedColor}` : ''
			const leatherPrompt = leatherImageUrl ? ` using the leather material shown in the reference image` : ''
			const prompt = `Please transform the sketch image into a realistic shoe image, preserving as much of the original sketch's details and design as possible without additional inference or creative changes.${colorPrompt}${leatherPrompt}`
			
			// 가죽 이미지가 있으면 base64로 변환
			let leatherBase64Data = ''
			if (leatherImageUrl) {
				try {
					const response = await fetch(leatherImageUrl)
					const blob = await response.blob()
					const arrayBuffer = await blob.arrayBuffer()
					const uint8Array = new Uint8Array(arrayBuffer)
					leatherBase64Data = btoa(String.fromCharCode(...uint8Array))
				} catch (error) {
					console.error('가죽 이미지 변환 실패:', error)
				}
			}
			
			setLoadingProgress(80)
			
			// 가죽 이미지가 있으면 두 개의 이미지를 모두 전송
			const contentArray = [
				prompt,
				{
					inlineData: {
						data: base64Data,
						mimeType: "image/png"
					}
				}
			]
			
			if (leatherBase64Data) {
				contentArray.push({
					inlineData: {
						data: leatherBase64Data,
						mimeType: "image/jpeg"
					}
				})
			}
			
			const result = await model.generateContent(contentArray)

			setLoadingProgress(90)
			const response = await result.response
			
			// 생성된 이미지 처리
			for (const part of response.candidates?.[0]?.content?.parts || []) {

				if (part.inlineData) {
					// base64 데이터를 데이터 URL로 변환
					const aiImageDataUrl = `data:image/png;base64,${part.inlineData.data}`
					// AI 생성 이미지를 캔버스에 추가
					console.log(aiImageDataUrl, 'AI 생성 이미지 url')
					
					setLoadingProgress(100)
					await addExportedImageToCanvas(aiImageDataUrl)
					
					// 로딩 완료
					clearInterval(progressInterval)
					setTimeout(() => {
						setIsLoading(false)
						setLoadingProgress(0)
					}, 500)
					return
				}
			}
			
			clearInterval(progressInterval)
			setIsLoading(false)
			setLoadingProgress(0)
			alert('AI 이미지 생성에 실패했습니다.')
			
		} catch (error) {
			console.error('AI 이미지 변환 실패:', error)
			
			// 진행률 인터벌 정리
			if (progressInterval) {
				clearInterval(progressInterval)
			}
			
			setIsLoading(false)
			setLoadingProgress(0)
			alert('AI 이미지 변환에 실패했습니다.')
		}
	}

	const addExportedImageToCanvas = async (dataUrl: string) => {
		if (!editorRef.current) return

		try {
			// 데이터 URL을 에셋으로 변환
			const imageAsset = {
				id: `asset:exported-${Date.now()}` as any,
				typeName: 'asset' as const,
				type: 'image' as const,
				props: {
					src: dataUrl,
					w: 400,
					h: 300,
					mimeType: 'image/png',
					isAnimated: false,
					name: 'exported-image.png'
				},
				meta: {}
			}
			console.log(imageAsset, '추출한 ImageAsset 생성 성공')
			// 에셋을 에디터에 추가
			await editorRef.current.createAssets([imageAsset])
			const asset = imageAsset

			console.log('내보낸 이미지 에셋 생성 완료:', asset)

			// 편집 가능한 이미지 도형 생성
			const imageShape = {
				type: 'image' as const,
				x: 100,
				y: 100,
				props: {
					assetId: asset.id,
					w: 400,
					h: 300
				}
			}

			// 에디터에 이미지 도형 추가
			const createdShapes = editorRef.current.createShapes([imageShape])
			
			console.log('내보낸 이미지 도형 생성 완료:', createdShapes)
			
			// 생성된 이미지로 카메라 이동
			editorRef.current.setCamera({ x: 0, y: 0, z: 1.5 })
			
		} catch (error) {
			console.error('내보낸 이미지 추가 실패:', error)
			alert('내보낸 이미지를 화이트보드에 추가하는데 실패했습니다.')
		}
	}

	return (
		<div className="design-container">
			{/* 로딩 오버레이 */}
			{isLoading && (
				<div className="loading-overlay">
					<div className="loading-content">
						<div className="spinner"></div>
						<div className="loading-text">이미지 변환 중...</div>
						<div className="progress-bar">
							<div 
								className="progress-fill" 
								style={{ width: `${loadingProgress}%` }}
							></div>
						</div>
						<div className="progress-text">{Math.round(loadingProgress)}%</div>
					</div>
				</div>
			)}
			
			<div className="sketch-controls">
				<div className="template-buttons">
					<button 
						className="template-btn"
						onClick={handleBaseClick}
					>
						베이스
					</button>
					<button 
						className="template-btn"
						onClick={handleStrapClick}
					>
						스트랩
					</button>
					<button 
						className="template-btn"
						onClick={handleAccessoryClick}
					>
						부자재
					</button>
					<div className="leather-button-container">
						<button 
							className="template-btn"
							onClick={handleLeatherClick}
						>
							가죽
						</button>
						{selectedLeather && (
							<div 
								className="selected-leather-chip"
								title={`선택된 가죽: ${selectedLeather}`}
								onClick={handleLeatherClick}
							>
								{selectedLeather === 'leather1' ? 'L1' : 'L2'}
							</div>
						)}
					</div>
					<div className="color-button-container">
						<button 
							className="template-btn"
							onClick={handleColorClick}
						>
							컬러
						</button>
						{selectedColor && (
							<div 
								className="selected-color-chip"
								style={{ backgroundColor: selectedColor }}
								title={`선택된 색상: ${selectedColor}`}
								onClick={handleColorClick}
							/>
						)}
					</div>
				</div>
				<div className="transform-section">
					<button 
						className="transform-btn"
						onClick={exportCanvasAsImage}
						disabled={false}
					>
						변환
					</button>
				</div>
			</div>
			<div className="tldraw-wrapper">
				<Tldraw 
				onMount={handleEditorMount}
				 licenseKey='tldraw-2026-01-04/WyJqWXh1VkZQTCIsWyIqIl0sMTYsIjIwMjYtMDEtMDQiXQ.DOPgWWJU87W+Pu4Ug4M+OfNVXPvLCQjpM35TLM2LaBgqSQMZd9VYCGR22b12N/aIs/Boj2IuoHQlRseuRQmF/w' 
				 />
			</div>
			
			{/* 베이스 모달 오버레이 */}
			{showSubButtons && (
				<div className="modal-overlay" onClick={() => setShowSubButtons(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>베이스 선택</h3>
							<button 
								className="modal-close-btn"
								onClick={() => setShowSubButtons(false)}
							>
								×
							</button>
						</div>
						<div className="modal-body">
							<div 
								className="modal-image-item"
								onClick={() => {
									loadSketchTemplate('loafer')
									setShowSubButtons(false)
								}}
							>
								<img 
									src="/loafer.JPG" 
									alt="로퍼" 
									className="modal-image"
								/>
								<span className="modal-label">로퍼</span>
							</div>
							<div 
								className="modal-image-item"
								onClick={() => {
									loadSketchTemplate('heel')
									setShowSubButtons(false)
								}}
							>
								<img 
									src="/heel.JPG" 
									alt="힐" 
									className="modal-image"
								/>
								<span className="modal-label">힐</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 스트랩 모달 오버레이 */}
			{showStrapModal && (
				<div className="modal-overlay" onClick={() => setShowStrapModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>스트랩 선택</h3>
							<button 
								className="modal-close-btn"
								onClick={() => setShowStrapModal(false)}
							>
								×
							</button>
						</div>
						<div className="modal-body">
							<div 
								className="modal-image-item"
								onClick={() => {
									loadStrapImage()
									setShowStrapModal(false)
								}}
							>
								<img 
									src="/strap1.png" 
									alt="스트랩" 
									className="modal-image"
								/>
								<span className="modal-label">스트랩</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 부자재 모달 오버레이 */}
			{showAccessoryModal && (
				<div className="modal-overlay" onClick={() => setShowAccessoryModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>부자재 선택</h3>
							<button 
								className="modal-close-btn"
								onClick={() => setShowAccessoryModal(false)}
							>
								×
							</button>
						</div>
						<div className="modal-body">
							<div 
								className="modal-image-item"
								onClick={() => {
									loadAccessoryImage('button1')
									setShowAccessoryModal(false)
								}}
							>
								<img 
									src="/button1.png" 
									alt="버튼1" 
									className="modal-image"
								/>
								<span className="modal-label">버튼1</span>
							</div>
							<div 
								className="modal-image-item"
								onClick={() => {
									loadAccessoryImage('button2')
									setShowAccessoryModal(false)
								}}
							>
								<img 
									src="/button2.png" 
									alt="버튼2" 
									className="modal-image"
								/>
								<span className="modal-label">버튼2</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 컬러 모달 오버레이 */}
			{showColorModal && (
				<div className="modal-overlay" onClick={() => setShowColorModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>컬러 선택</h3>
							<button 
								className="modal-close-btn"
								onClick={() => setShowColorModal(false)}
							>
								×
							</button>
						</div>
						<div className="modal-body color-grid">
							<div 
								className="color-item"
								onClick={() => handleColorSelect('#FF0000')}
								style={{ backgroundColor: '#FF0000' }}
							>
								<span className="color-label">빨강</span>
							</div>
							<div 
								className="color-item"
								onClick={() => handleColorSelect('#FFA500')}
								style={{ backgroundColor: '#FFA500' }}
							>
								<span className="color-label">주황</span>
							</div>
							<div 
								className="color-item"
								onClick={() => handleColorSelect('#FFFF00')}
								style={{ backgroundColor: '#FFFF00' }}
							>
								<span className="color-label">노랑</span>
							</div>
							<div 
								className="color-item"
								onClick={() => handleColorSelect('#00FF00')}
								style={{ backgroundColor: '#00FF00' }}
							>
								<span className="color-label">초록</span>
							</div>
							<div 
								className="color-item"
								onClick={() => handleColorSelect('#0000FF')}
								style={{ backgroundColor: '#0000FF' }}
							>
								<span className="color-label">파랑</span>
							</div>
							<div 
								className="color-item"
								onClick={() => handleColorSelect('#000080')}
								style={{ backgroundColor: '#000080' }}
							>
								<span className="color-label">남색</span>
							</div>
							<div 
								className="color-item"
								onClick={() => handleColorSelect('#800080')}
								style={{ backgroundColor: '#800080' }}
							>
								<span className="color-label">보라</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 가죽 모달 오버레이 */}
			{showLeatherModal && (
				<div className="modal-overlay" onClick={() => setShowLeatherModal(false)}>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h3>가죽 소재 선택</h3>
							<button 
								className="modal-close-btn"
								onClick={() => setShowLeatherModal(false)}
							>
								×
							</button>
						</div>
						<div className="modal-body leather-grid">
							<div 
								className="leather-item"
								onClick={() => handleLeatherSelect('leather1')}
							>
								<img 
									src="/leather1.jpeg" 
									alt="가죽1" 
									className="leather-image"
								/>
								<span className="leather-label">가죽1</span>
							</div>
							<div 
								className="leather-item"
								onClick={() => handleLeatherSelect('leather2')}
							>
								<img 
									src="/leather2.jpeg" 
									alt="가죽2" 
									className="leather-image"
								/>
								<span className="leather-label">가죽2</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default App
