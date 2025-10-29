import { useState, useRef, useEffect } from 'react'
import { Tldraw, Editor, TLEditorComponents, useEditor } from 'tldraw'
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
	const [showAccessoryModal, setShowAccessoryModal] = useState(false)
	const [showColorModal, setShowColorModal] = useState(false)
	const [showLeatherModal, setShowLeatherModal] = useState(false)
	const [selectedColor, setSelectedColor] = useState<string>('')
	const [selectedLeather, setSelectedLeather] = useState<string>('')
	const [isLoading, setIsLoading] = useState(false)

	return (
		<div className="app">
			<div className="header">
				<h1 className="title">CUSME STUDIO</h1>
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
				{activeTab === 'moodboard' && (
					<MoodboardTab 
						editorRef={moodboardEditorRef}
						activeTab={activeTab}
					/>
				)}
				{activeTab === 'design' && (
					<DesignTab 
						editorRef={designEditorRef}
						activeTab={activeTab}
						showSubButtons={showSubButtons}
						setShowSubButtons={setShowSubButtons}
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
					/>
				)}
			</div>
		</div>
	)
}

interface MoodboardTabProps {
	editorRef: React.MutableRefObject<Editor | null>
	activeTab: TabType
}

// 디자인 탭용 스케치 영역 컴포넌트
function DesignSketchComponent() {
	const editor = useEditor()
	const [hasImageInSketchArea, setHasImageInSketchArea] = useState(false)

	// 스케치 영역 좌표
	const sketchArea = {
		x: 100,
		y: 100,
		width: 500,
		height: 400
	}

	// shapes 변경을 감지하여 스케치 영역 내 이미지 여부 업데이트
	useEffect(() => {
		const checkImageInSketchArea = () => {
			const allShapes = editor.getCurrentPageShapes()
			const hasImage = allShapes.some((shape: any) => {
				if (shape.type !== 'image') return false
				
				const imgX = shape.x
				const imgY = shape.y
				const imgW = shape.props?.w || 0
				const imgH = shape.props?.h || 0
				
				// 이미지가 스케치 영역 안에 완전히 들어왔는지 확인
				return (
					imgX >= sketchArea.x &&
					imgY >= sketchArea.y &&
					imgX + imgW <= sketchArea.x + sketchArea.width &&
					imgY + imgH <= sketchArea.y + sketchArea.height
				)
			})
			setHasImageInSketchArea(hasImage)
		}

		// 초기 체크
		checkImageInSketchArea()

		// shapes 변경 감지
		const unsubscribe = editor.store.listen(() => {
			checkImageInSketchArea()
		})

		return () => {
			unsubscribe()
		}
	}, [editor])

	const handleTransform = () => {
		// 커스텀 이벤트 발생
		window.dispatchEvent(new CustomEvent('transform-sketch'))
	}

	return (
		<div
			style={{
				position: 'absolute',
				top: sketchArea.y,
				left: sketchArea.x,
				width: sketchArea.width,
				height: sketchArea.height,
				border: '2px dashed #ccc',
				borderRadius: 8,
				backgroundColor: 'rgba(255, 255, 255, 0.5)',
				pointerEvents: 'none',
				zIndex: 0,
			}}
			onPointerDown={editor.markEventAsHandled}
		>
			<div
				style={{
					position: 'absolute',
					top: -30,
					left: 10,
					fontSize: 14,
					color: '#666',
					fontWeight: 'bold',
				}}
			>
				스케치 영역
			</div>
			{hasImageInSketchArea && (
				<button
					onClick={handleTransform}
					style={{
						position: 'absolute',
						top: 10,
						right: 10,
						padding: '8px 16px',
						fontSize: 14,
						fontWeight: 'bold',
						color: '#fff',
						backgroundColor: '#007bff',
						border: 'none',
						borderRadius: 4,
						cursor: 'pointer',
						pointerEvents: 'auto',
						zIndex: 1,
					}}
					onPointerDown={(e) => {
						e.stopPropagation()
					}}
				>
					변환
				</button>
			)}
		</div>
	)
}

// 무드보드 카테고리 영역 컴포넌트
function MoodboardCategoryComponent() {
	const editor = useEditor()

	const categories = [
		'컨셉/스타일',
		'컬러 팔레트',
		'소재/패턴',
		'실루엣',
		'디테일',
		'레퍼런스'
	]

	// 고정된 위치와 크기
	const positions = [
		{ top: 50, left: 50, width: 340, height: 240 },   // 컨셉/스타일
		{ top: 50, left: 410, width: 340, height: 240 },   // 컬러 팔레트
		{ top: 50, left: 770, width: 340, height: 240 },   // 소재/패턴
		{ top: 310, left: 50, width: 340, height: 240 },  // 실루엣
		{ top: 310, left: 410, width: 340, height: 240 }, // 디테일
		{ top: 310, left: 770, width: 340, height: 240 }  // 레퍼런스
	]

	return (
		<>
			{categories.map((category, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						top: positions[i].top,
						left: positions[i].left,
						width: positions[i].width,
						height: positions[i].height,
						border: '2px solid #ccc',
						borderRadius: 8,
						backgroundColor: 'rgba(255, 255, 255, 0.3)',
						pointerEvents: 'none',
						zIndex: 0,
					}}
					onPointerDown={editor.markEventAsHandled}
				>
					<div
						style={{
							position: 'absolute',
							top: 10,
							left: 10,
							fontSize: 16,
							color: '#333',
							fontWeight: 'bold',
							pointerEvents: 'none',
						}}
					>
						{category}
					</div>
				</div>
			))}
		</>
	)
}

// 무드보드 탭용 컴포넌트
const moodboardComponents: TLEditorComponents = {
	OnTheCanvas: MoodboardCategoryComponent,
}

// 디자인 탭용 컴포넌트
const designComponents: TLEditorComponents = {
	OnTheCanvas: DesignSketchComponent,
}

function MoodboardTab({ editorRef }: MoodboardTabProps) {
	const handleEditorMount = (editor: Editor) => {
		if (editorRef.current !== editor) {
			editorRef.current = editor
		}
	}

	return (
		<div className="moodboard-container">
			<Tldraw 
				onMount={handleEditorMount}
				licenseKey='tldraw-2026-01-04/WyJqWXh1VkZQTCIsWyIqIl0sMTYsIjIwMjYtMDEtMDQiXQ.DOPgWWJU87W+Pu4Ug4M+OfNVXPvLCQjpM35TLM2LaBgqSQMZd9VYCGR22b12N/aIs/Boj2IuoHQlRseuRQmF/w'
				components={moodboardComponents}
			/>
		</div>
	)
}

interface DesignTabProps {
	editorRef: React.MutableRefObject<Editor | null>
	activeTab: TabType
	showSubButtons: boolean
	setShowSubButtons: (value: boolean) => void
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
}

	function DesignTab({
	editorRef,
	activeTab: _activeTab,
	showSubButtons,
	setShowSubButtons,
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
	setIsLoading
}: DesignTabProps) {

	const handleEditorMount = (editor: Editor) => {
		if (editorRef.current !== editor) {
			editorRef.current = editor
		}
		
		// 이미 shape가 있는지 확인
		const shapes = editor.getCurrentPageShapes()
		if (shapes.length === 0) {
			createDesignTemplate(editor)
		}
	}

	const createDesignTemplate = (_editor: Editor) => {
		// 디자인 탭 초기화
		console.log('스케치 영역 생성 완료')
	}

	const handleBaseClick = () => {
		setShowSubButtons(!showSubButtons)
		setShowAccessoryModal(false) // 다른 모달 닫기
		setShowColorModal(false) // 다른 모달 닫기
		setShowLeatherModal(false) // 다른 모달 닫기
	}

	const handleAccessoryClick = () => {
		setShowAccessoryModal(!showAccessoryModal)
		setShowSubButtons(false) // 다른 모달 닫기
		setShowColorModal(false) // 다른 모달 닫기
		setShowLeatherModal(false) // 다른 모달 닫기
	}

	const handleColorClick = () => {
		setShowColorModal(!showColorModal)
		setShowSubButtons(false) // 다른 모달 닫기
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
		setShowAccessoryModal(false) // 다른 모달 닫기
		setShowColorModal(false) // 다른 모달 닫기
	}

	const handleLeatherSelect = (leatherName: string) => {
		setSelectedLeather(leatherName)
		setShowLeatherModal(false)
	}

	const loadSketchTemplate = async (type: '더비' | '몽크스트랩' | '보트' | '사막화' | '윙팁' | '첼시') => {
		if (!editorRef.current) return

		const imageUrl = `${window.location.origin}/${type}.png`

		try {
			// 이미지 로드 및 배경 제거
			const img = new Image()
			img.crossOrigin = 'anonymous'
			
			img.onload = async () => {
				if (!editorRef.current) return
				
				// 배경 제거를 위해 Canvas 사용
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')
				
				if (!ctx) return

				canvas.width = img.width
				canvas.height = img.height
				
				// 이미지 그리기
				ctx.drawImage(img, 0, 0)
				
				// 이미지 데이터 가져오기
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
				const data = imageData.data
				
				// 배경(흰색 또는 매우 밝은 색)을 투명하게 만들기
				for (let i = 0; i < data.length; i += 4) {
					const r = data[i]
					const g = data[i + 1]
					const b = data[i + 2]
					const a = data[i + 3]
					
					// 밝은 색 (흰색 배경)을 투명하게
					const brightness = (r + g + b) / 3
					if (brightness > 240 && a > 200) {
						data[i + 3] = 0 // 투명하게
					}
				}
				
				ctx.putImageData(imageData, 0, 0)
				
				// 배경이 제거된 이미지를 데이터 URL로 변환
				const processedImageUrl = canvas.toDataURL('image/png')
				
				// TLImageAsset 구조에 맞는 에셋 생성
				const imageAsset = {
					id: `asset:${type}-${Date.now()}` as any,
					typeName: 'asset' as const,
					type: 'image' as const,
					props: {
						src: processedImageUrl,
						w: img.width,
						h: img.height,
						mimeType: 'image/png',
						isAnimated: false,
						name: `${type}.png`
					},
					meta: {}
				}

				// 에셋을 에디터에 추가
				await editorRef.current.createAssets([imageAsset])
				const asset = imageAsset
				
				console.log('에셋 생성 완료:', asset)

				// 편집 가능한 이미지 도형 생성 (스케치 영역 컴포넌트 안에 배치)
				const imageShape = {
					type: 'image' as const,
					x: 150,
					y: 150,
					props: {
						assetId: asset.id,
						w: 400,
						h: 280
					}
				}

				// 에디터에 이미지 도형 추가
				const createdShapes = editorRef.current.createShapes([imageShape])
				
				console.log('이미지 도형 생성 완료:', createdShapes)
				
				// 생성된 이미지로 카메라 이동
				editorRef.current.setCamera({ x: 0, y: 0, z: 1.5 })
			}
			
			img.src = imageUrl
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

			// 스케치 영역 범위 정의 (컴포넌트 좌표 기준)
			const sketchArea = {
				x: 100,  // 컴포넌트의 left 위치
				y: 100,  // 컴포넌트의 top 위치
				width: 500,
				height: 400
			}

			// 스케치 영역 안에 있는 이미지만 필터링
			const shapesInSketchArea = allShapes.filter(shape => {
				// 이미지 타입만 확인
				if (shape.type !== 'image') return false
				
				// 이미지의 중심점 또는 좌상단 좌표로 확인
				const imgX = shape.x
				const imgY = shape.y
				const imgW = (shape as any).props?.w || 0
				const imgH = (shape as any).props?.h || 0
				
				// 이미지가 스케치 영역과 겹치는지 확인
				const imgRight = imgX + imgW
				const imgBottom = imgY + imgH
				const sketchRight = sketchArea.x + sketchArea.width
				const sketchBottom = sketchArea.y + sketchArea.height
				
				// 이미지가 스케치 영역과 겹치는 경우
				const isOverlapping = !(
					imgRight < sketchArea.x ||
					imgX > sketchRight ||
					imgBottom < sketchArea.y ||
					imgY > sketchBottom
				)
				
				return isOverlapping
			})
			
			console.log('전체 shape 개수:', allShapes.length)
			console.log('스케치 영역 내 shape 개수:', shapesInSketchArea.length)
			console.log('스케치 영역 내 shapes:', shapesInSketchArea)
			
			if (shapesInSketchArea.length === 0) {
				alert('스케치 영역에 이미지가 없습니다.')
				return
			}

			// 베이스 이미지가 스케치 영역에 있는지 확인
			const assets = editorRef.current.getAssets()
			const hasBaseImage = shapesInSketchArea.some(shape => {
				if (shape.type !== 'image') return false
				const asset = assets.find(a => a.id === (shape as any).props?.assetId)
				if (!asset) return false
				
				// 처리된 이미지는 asset의 name이나 src로 판단
				const src = asset.props?.src || ''
				const name = (asset.props as any)?.name || ''
				
				const baseImageNames = ['더비', '몽크스트랩', '보트', '사막화', '윙팁', '첼시']
				return baseImageNames.some(baseName => 
					(name && name.includes(baseName)) || (src && src.includes(baseName))
				)
			})

			if (!hasBaseImage) {
				alert('스케치 영역에 베이스 이미지가 필요합니다.')
				return
			}
			
			// 스케치 영역 안에 있는 shape들만 이미지로 추출
			const image = await editorRef.current.toImageDataUrl(shapesInSketchArea)
			console.log(image.url)
			
			// AI로 이미지 변환
			const leatherImageUrl = selectedLeather ? `${window.location.origin}/${selectedLeather}.jpeg` : undefined
			await transformImageWithAI(image.url, leatherImageUrl)
			
		} catch (error) {
			console.error('이미지 내보내기 실패:', error)
			alert('이미지 내보내기에 실패했습니다.')
		}
	}

	// 변환 버튼 클릭 이벤트 리스너
	useEffect(() => {
		const handleTransformEvent = async () => {
			await exportCanvasAsImage()
		}

		window.addEventListener('transform-sketch', handleTransformEvent)
		return () => {
			window.removeEventListener('transform-sketch', handleTransformEvent)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const transformImageWithAI = async (imageDataUrl: string, leatherImageUrl?: string) => {
		try {
			// 로딩 시작
			setIsLoading(true)

			// Gemini API 키 (환경 변수에서 가져오거나 직접 설정)
			const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyA7Czs8HbA-Hud1Zmyhe08vQr62gYjL0FU'
			
			if (API_KEY !== 'AIzaSyA7Czs8HbA-Hud1Zmyhe08vQr62gYjL0FU') {
				setIsLoading(false)
				alert('Gemini API 키를 설정해주세요.\n\n방법 1: .env 파일에 VITE_GEMINI_API_KEY=your_api_key 추가\n방법 2: 코드에서 직접 API_KEY 변수 수정')
				return
			}

			const genAI = new GoogleGenerativeAI(API_KEY)
			
			// 이미지 데이터를 base64로 변환
			const base64Data = imageDataUrl.split(',')[1]
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
			const response = await result.response
			
			// 생성된 이미지 처리
			for (const part of response.candidates?.[0]?.content?.parts || []) {

				if (part.inlineData) {
					// base64 데이터를 데이터 URL로 변환
					const aiImageDataUrl = `data:image/png;base64,${part.inlineData.data}`
					// AI 생성 이미지를 캔버스에 추가
					console.log(aiImageDataUrl, 'AI 생성 이미지 url')
					
					await addExportedImageToCanvas(aiImageDataUrl)
					
					// 로딩 완료
					setTimeout(() => {
						setIsLoading(false)
					}, 500)
					return
				}
			}
			
			setIsLoading(false)
			alert('AI 이미지 생성에 실패했습니다.')
			
		} catch (error) {
			console.error('AI 이미지 변환 실패:', error)
			setIsLoading(false)
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

			// 편집 가능한 이미지 도형 생성 (스케치 영역 오른쪽에 배치)
			const imageShape = {
				type: 'image' as const,
				x: 650, // 스케치 영역 x: 100 + width: 500 = 600 오른쪽에 배치
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
			</div>
			<div className="tldraw-wrapper">
				<Tldraw 
					onMount={handleEditorMount}
					licenseKey='tldraw-2026-01-04/WyJqWXh1VkZQTCIsWyIqIl0sMTYsIjIwMjYtMDEtMDQiXQ.DOPgWWJU87W+Pu4Ug4M+OfNVXPvLCQjpM35TLM2LaBgqSQMZd9VYCGR22b12N/aIs/Boj2IuoHQlRseuRQmF/w'
					components={designComponents}
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
									loadSketchTemplate('더비')
									setShowSubButtons(false)
								}}
							>
								<img 
									src="/더비.png" 
									alt="더비" 
									className="modal-image"
								/>
								<span className="modal-label">더비</span>
							</div>
							<div 
								className="modal-image-item"
								onClick={() => {
									loadSketchTemplate('몽크스트랩')
									setShowSubButtons(false)
								}}
							>
								<img 
									src="/몽크스트랩.png" 
									alt="몽크스트랩" 
									className="modal-image"
								/>
								<span className="modal-label">몽크스트랩</span>
							</div>
							<div 
								className="modal-image-item"
								onClick={() => {
									loadSketchTemplate('보트')
									setShowSubButtons(false)
								}}
							>
								<img 
									src="/보트.png" 
									alt="보트" 
									className="modal-image"
								/>
								<span className="modal-label">보트</span>
							</div>
							<div 
								className="modal-image-item"
								onClick={() => {
									loadSketchTemplate('사막화')
									setShowSubButtons(false)
								}}
							>
								<img 
									src="/사막화.png" 
									alt="사막화" 
									className="modal-image"
								/>
								<span className="modal-label">사막화</span>
							</div>
							<div 
								className="modal-image-item"
								onClick={() => {
									loadSketchTemplate('윙팁')
									setShowSubButtons(false)
								}}
							>
								<img 
									src="/윙팁.png" 
									alt="윙팁" 
									className="modal-image"
								/>
								<span className="modal-label">윙팁</span>
							</div>
							<div 
								className="modal-image-item"
								onClick={() => {
									loadSketchTemplate('첼시')
									setShowSubButtons(false)
								}}
							>
								<img 
									src="/첼시.png" 
									alt="첼시" 
									className="modal-image"
								/>
								<span className="modal-label">첼시</span>
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
									loadStrapImage()
									setShowAccessoryModal(false)
								}}
							>
								<img 
									src="/strap1.png" 
									alt="스트랩" 
									className="modal-image"
								/>
								<span className="modal-label">스트랩</span>
							</div>
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
