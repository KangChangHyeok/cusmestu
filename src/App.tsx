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
	const [selectedColor, setSelectedColor] = useState<string>('')
	const [isLoading, setIsLoading] = useState(false)
	const [selectedGender, setSelectedGender] = useState<'men' | 'women' | null>(null)
	const [selectedCategory, setSelectedCategory] = useState<'boots' | 'flats' | 'heels' | 'loafers' | 'sandal' | 'sneakers' | null>(null)

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
						selectedColor={selectedColor}
						setSelectedColor={setSelectedColor}
						isLoading={isLoading}
						setIsLoading={setIsLoading}
						selectedGender={selectedGender}
						setSelectedGender={setSelectedGender}
						selectedCategory={selectedCategory}
						setSelectedCategory={setSelectedCategory}
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
	selectedColor: string
	setSelectedColor: (value: string) => void
	isLoading: boolean
	setIsLoading: (value: boolean) => void
	selectedGender: 'men' | 'women' | null
	setSelectedGender: (value: 'men' | 'women' | null) => void
	selectedCategory: 'boots' | 'flats' | 'heels' | 'loafers' | 'sandal' | 'sneakers' | null
	setSelectedCategory: (value: 'boots' | 'flats' | 'heels' | 'loafers' | 'sandal' | 'sneakers' | null) => void
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
	selectedColor,
	setSelectedColor,
	isLoading,
	setIsLoading,
	selectedGender,
	setSelectedGender,
	selectedCategory,
	setSelectedCategory
}: DesignTabProps) {

    // 패턴 선택 상태 (디자인 탭 내부 보관)
    const [showPatternModal, setShowPatternModal] = useState(false)
    const [selectedPattern, setSelectedPattern] = useState<string>('')
    const [selectedPatternUrl, setSelectedPatternUrl] = useState<string>('')
    const [selectedPatternData, setSelectedPatternData] = useState<{ base64: string, mime: string } | null>(null)

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
        // 패턴/컬러 외 모달 닫기
		// 모달 열 때 선택 상태 초기화
		if (!showSubButtons) {
			setSelectedGender(null)
			setSelectedCategory(null)
		}
	}

	const handleAccessoryClick = () => {
		setShowAccessoryModal(!showAccessoryModal)
		setShowSubButtons(false) // 다른 모달 닫기
		setShowColorModal(false) // 다른 모달 닫기
        // 패턴/컬러 외 모달 닫기
	}

	const handleColorClick = () => {
		setShowColorModal(!showColorModal)
		setShowSubButtons(false) // 다른 모달 닫기
		setShowAccessoryModal(false) // 다른 모달 닫기
        // 패턴/컬러 외 모달 닫기
	}

	const handleColorSelect = (colorHex: string) => {
		setSelectedColor(colorHex)
		setShowColorModal(false)
	}



	const loadSketchTemplate = async (imagePath: string, imageName: string) => {
		if (!editorRef.current) return

		const imageUrl = `${window.location.origin}${imagePath}`

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
					id: `asset:${imageName}-${Date.now()}` as any,
					typeName: 'asset' as const,
					type: 'image' as const,
					props: {
						src: processedImageUrl,
						w: img.width,
						h: img.height,
						mimeType: 'image/png',
						isAnimated: false,
						name: imageName
					},
					meta: {
						originalPath: imagePath // 원본 경로 저장 (베이스 이미지 인식용)
					}
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
				
				// 원본 경로가 /sketchs/men/ 또는 /sketchs/women/ 경로를 포함하는지 확인
				const originalPath = (asset.meta as any)?.originalPath || ''
				const isBaseImage = originalPath.includes('/sketchs/men/') || originalPath.includes('/sketchs/women/')
				
				// 원본 경로가 없는 경우 (기존 방식 호환성을 위해) name이나 src로 판단
				if (!originalPath) {
					const src = asset.props?.src || ''
					const name = (asset.props as any)?.name || ''
					const baseImageNames = ['더비', '몽크스트랩', '보트', '사막화', '윙팁', '첼시']
					return baseImageNames.some(baseName => 
						(name && name.includes(baseName)) || (src && src.includes(baseName))
					)
				}
				
				return isBaseImage
			})

			if (!hasBaseImage) {
				alert('스케치 영역에 베이스 이미지가 필요합니다.')
				return
			}
			
			// 스케치 영역 안에 있는 shape들만 이미지로 추출
			const image = await editorRef.current.toImageDataUrl(shapesInSketchArea)
			console.log(image.url)
			
            // AI로 이미지 변환 (패턴/컬러만 반영) - 선택 패턴 URL을 파라미터로 전달
            const patternUrl = `public/patterns/${encodeURIComponent(selectedPattern)}`
            console.log('[transform] imageUrl:', image.url, 'patternUrl:', patternUrl)
            await transformImageWithAI(image.url, patternUrl)
			
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

const transformImageWithAI = async (imageDataUrl: string, patternUrl?: string) => {
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
			const patternImageData = patternUrl		// Gemini에 이미지와 프롬프트 전송 (할당량이 더 많은 모델 사용)
			const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" })
			
			// 선택된 색상이 유효한 HEX 코드인지 확인 및 정규화
			let validColor = null
			if (selectedColor) {
				const normalizedColor = selectedColor.trim().toUpperCase()
				if (/^#[0-9A-Fa-f]{6}$/.test(normalizedColor)) {
					validColor = normalizedColor
				} else if (/^#[0-9A-Fa-f]{1,5}$/i.test(normalizedColor)) {
					// 불완전한 HEX 코드는 0으로 패딩
					const hexPart = normalizedColor.slice(1).padEnd(6, '0').substring(0, 6)
					validColor = `#${hexPart}`
				}
			}
			
			// 색상 프롬프트 생성 - 더 명확하고 강조된 설명
			const colorPrompt = validColor ? ` IMPORTANT: Apply the exact hex color ${validColor} to the shoe upper material. The color reference image provided shows the exact color to use. Make sure the entire upper surface consistently uses this color ${validColor}. Do not use any other color for the upper - only use ${validColor}.` : ''
			const patternPrompt = patternUrl ? ` Tile and wrap the provided pattern reference realistically onto the shoe upper (avoid stretching; follow curvature; keep plausible scale).` : ''
			const prompt = `Task: Convert the sketch into a photorealistic shoe image while preserving the original design lines and silhouette. ${colorPrompt} ${patternPrompt} Do not change the shoe design. Do not add text or logos. Render a clean studio background.`
			
			console.log('[AI 변환] 선택된 색상:', validColor || '없음')
			console.log('[AI 변환] 프롬프트:', prompt)
			
// leather reference removed
			
// 패턴 이미지가 있으면 함께 전송
const contentArray: any[] = [
	{
		inlineData: {
			data: base64Data,
			mimeType: "image/png"
		}
	},
	{ text: prompt },	
			]


            // 패턴 이미지가 URL로 전달된 경우 전송
            if (patternUrl) {

                try {
                    const res = await fetch(patternUrl)
                    const blob = await res.blob()
                    const reader = new FileReader()
                    const base64 = await new Promise<string>((resolve, reject) => {
                        reader.onloadend = () => {
                            const result = reader.result as string
                            resolve(result.split(',')[1] || '')
                        }
                        reader.onerror = reject
                        reader.readAsDataURL(blob)
                    })
                    const lower = patternUrl.toLowerCase()
                    const mime = lower.endsWith('.png') ? 'image/png' : lower.endsWith('.webp') ? 'image/webp' : (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) ? 'image/jpeg' : blob.type || 'image/jpeg'
                    contentArray.push({ inlineData: { data: base64, mimeType: mime } })
                } catch (e) {
                    console.error('패턴 URL 로드 실패:', e)
                }
            }

			// 컬러 스와치 이미지를 함께 전송하여 색상 적용을 강화
			// 색상 스와치를 더 크게 만들어서 AI가 색상을 더 정확하게 인식할 수 있도록 함
			if (validColor) {
				try {
					const canvas = document.createElement('canvas')
					// 더 큰 크기로 생성하여 색상 인식 정확도 향상
					canvas.width = 256
					canvas.height = 256
					const ctx = canvas.getContext('2d')
					if (ctx) {
						// 유효한 색상으로 설정
						ctx.fillStyle = validColor
						ctx.fillRect(0, 0, canvas.width, canvas.height)
						const dataUrl = canvas.toDataURL('image/png')
						const base64 = dataUrl.split(',')[1]
						contentArray.push({ 
							inlineData: { 
								data: base64, 
								mimeType: 'image/png' 
							}
						})
						console.log('[AI 변환] 색상 스와치 이미지 전송:', validColor)
					}
				} catch (e) {
					console.error('컬러 스와치 생성 실패:', e)
				}
			} else {
				console.log('[AI 변환] 색상이 선택되지 않았거나 유효하지 않음')
			}
			
			// 하나의 요청에서 텍스트+여러 이미지를 동시에 전송
			const result = await model.generateContent({
				contents: [
					{
						role: 'user',
						parts: contentArray
					}
				]
			})
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
					<div className="pattern-button-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<button 
							className="template-btn"
                            onClick={() => {
								setShowPatternModal(true)
								setShowSubButtons(false)
								setShowAccessoryModal(false)
								setShowColorModal(false)
							}}
						>
							패턴
						</button>
						{selectedPattern && (
							<div 
								title={`선택된 패턴: ${selectedPattern}`}
								onClick={() => setShowPatternModal(true)}
								style={{
									width: 32,
									height: 24,
									borderRadius: 4,
									border: '2px solid #333',
									boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
									cursor: 'pointer',
									backgroundImage: `url(${`/patterns/${encodeURIComponent(selectedPattern)}`})`,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
								}}
							/>
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
		{/* 패턴 모달 오버레이 */}
		{showPatternModal && (
			<div className="modal-overlay" onClick={() => setShowPatternModal(false)}>
				<div className="modal-content" onClick={(e) => e.stopPropagation()}>
					<div className="modal-header">
						<h3>패턴 선택</h3>
						<button 
							className="modal-close-btn"
							onClick={() => setShowPatternModal(false)}
						>
							×
						</button>
					</div>
					<div className="modal-body leather-grid">
						{[
							"_.jpeg",
							"_ (1).jpeg",
							"_ (2).jpeg",
							"_ (3).jpeg",
							"_ (4).jpeg",
							"_ (5).jpeg",
							"_ (6).jpeg",
							"a6478315-b040-4924-bca8-676441038fcc.jpeg",
							"Agostino Veneziano - Ornamental print (c_ 1530).jpeg",
							"Back in time Hand cut leather patterns for Bags and jackets by Logan Riese.jpeg",
							"beullaeg-gogeub-gajug-jilgam-baegyeong.jpg",
							"Checkered Fabric Pattern Free Download.jpeg",
							"Crocodile-Pattern-and-PU-Leather-for-Hand-Bag.webp",
							"Discover our unique collection of camouflage….jpeg",
							"Draper James Free Holiday 2019 Phone….jpeg",
							"Let us bring your vision to life_ From the best….jpeg",
							"Morandini Marcello 534-2008 not interesting enough….jpeg",
							"New Burberry monogram, designed by Peter Saville….jpeg",
							"OPF7RR0.jpg",
							"preview.jpg",
						].map((name, idx) => (
							<div 
								key={name}
								className="leather-item"
                                onClick={async () => {
                                    setSelectedPattern(name)
                                    setSelectedPatternUrl(`${window.location.origin}/patterns/${encodeURIComponent(name)}`)
                                    try {
                                        const url = `/patterns/${encodeURIComponent(name)}`
                                        const res = await fetch(url)
                                        const blob = await res.blob()
                                        const reader = new FileReader()
                                        const base64 = await new Promise<string>((resolve, reject) => {
                                            reader.onloadend = () => {
                                                const result = reader.result as string
                                                resolve(result.split(',')[1] || '')
                                            }
                                            reader.onerror = reject
                                            reader.readAsDataURL(blob)
                                        })
                                        const lower = name.toLowerCase()
                                        const mime = lower.endsWith('.png') ? 'image/png' : lower.endsWith('.webp') ? 'image/webp' : (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) ? 'image/jpeg' : 'image/jpeg'
                                        setSelectedPatternData({ base64, mime })
                                    } catch (e) {
                                        console.error('패턴 로드 실패:', e)
                                        setSelectedPatternData(null)
                                    }
                                    setShowPatternModal(false)
                                }}
							>
								<img 
									src={`/patterns/${encodeURIComponent(name)}`}
									alt={`패턴 ${idx + 1}`}
									className="leather-image"
								/>
								<span className="leather-label">패턴 {idx + 1}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		)}
			
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
							{!selectedGender ? (
								// 성별 선택
								<>
									<div 
										className="modal-image-item"
										onClick={() => setSelectedGender('men')}
									>
										<div className="modal-image gender-select" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
											👔 남성
										</div>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => setSelectedGender('women')}
									>
										<div className="modal-image gender-select" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
											👗 여성
										</div>
									</div>
								</>
							) : selectedGender === 'men' ? (
								// 남성 신발 타입 선택
								<>
									<div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
										<button 
											className="template-btn"
											onClick={() => {
												setSelectedGender(null)
												setSelectedCategory(null)
											}}
										>
											← 뒤로
										</button>
										<span style={{ fontSize: '1.125rem', fontWeight: '300', letterSpacing: '2px' }}>남성 신발 선택</span>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => {
											loadSketchTemplate('/sketchs/men/더비.png', '더비.png')
											setShowSubButtons(false)
											setSelectedGender(null)
										}}
									>
										<img 
											src="/sketchs/men/더비.png" 
											alt="더비" 
											className="modal-image"
										/>
										<span className="modal-label">더비</span>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => {
											loadSketchTemplate('/sketchs/men/로퍼.png', '로퍼.png')
											setShowSubButtons(false)
											setSelectedGender(null)
										}}
									>
										<img 
											src="/sketchs/men/로퍼.png" 
											alt="로퍼" 
											className="modal-image"
										/>
										<span className="modal-label">로퍼</span>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => {
											loadSketchTemplate('/sketchs/men/몽크스트랩.png', '몽크스트랩.png')
											setShowSubButtons(false)
											setSelectedGender(null)
										}}
									>
										<img 
											src="/sketchs/men/몽크스트랩.png" 
											alt="몽크스트랩" 
											className="modal-image"
										/>
										<span className="modal-label">몽크스트랩</span>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => {
											loadSketchTemplate('/sketchs/men/보트슈즈.png', '보트슈즈.png')
											setShowSubButtons(false)
											setSelectedGender(null)
										}}
									>
										<img 
											src="/sketchs/men/보트슈즈.png" 
											alt="보트슈즈" 
											className="modal-image"
										/>
										<span className="modal-label">보트슈즈</span>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => {
											loadSketchTemplate('/sketchs/men/옥스포드.png', '옥스포드.png')
											setShowSubButtons(false)
											setSelectedGender(null)
										}}
									>
										<img 
											src="/sketchs/men/옥스포드.png" 
											alt="옥스포드" 
											className="modal-image"
										/>
										<span className="modal-label">옥스포드</span>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => {
											loadSketchTemplate('/sketchs/men/테슬로퍼.png', '테슬로퍼.png')
											setShowSubButtons(false)
											setSelectedGender(null)
										}}
									>
										<img 
											src="/sketchs/men/테슬로퍼.png" 
											alt="테슬로퍼" 
											className="modal-image"
										/>
										<span className="modal-label">테슬로퍼</span>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => {
											loadSketchTemplate('/sketchs/men/플레인토.png', '플레인토.png')
											setShowSubButtons(false)
											setSelectedGender(null)
										}}
									>
										<img 
											src="/sketchs/men/플레인토.png" 
											alt="플레인토" 
											className="modal-image"
										/>
										<span className="modal-label">플레인토</span>
									</div>
								</>
							) : !selectedCategory ? (
								// 여성 카테고리 선택
								<>
									<div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
										<button 
											className="template-btn"
											onClick={() => {
												setSelectedGender(null)
												setSelectedCategory(null)
											}}
										>
											← 뒤로
										</button>
										<span style={{ fontSize: '1.125rem', fontWeight: '300', letterSpacing: '2px' }}>여성 신발 카테고리 선택</span>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => setSelectedCategory('boots')}
									>
										<div className="modal-image category-select" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
											부츠
										</div>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => setSelectedCategory('flats')}
									>
										<div className="modal-image category-select" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
											플랫
										</div>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => setSelectedCategory('heels')}
									>
										<div className="modal-image category-select" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
											힐
										</div>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => setSelectedCategory('loafers')}
									>
										<div className="modal-image category-select" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
											로퍼
										</div>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => setSelectedCategory('sandal')}
									>
										<div className="modal-image category-select" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
											샌들
										</div>
									</div>
									<div 
										className="modal-image-item"
										onClick={() => setSelectedCategory('sneakers')}
									>
										<div className="modal-image category-select" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
											스니커즈
										</div>
									</div>
								</>
							) : (
								// 여성 하위 신발 이미지 리스트
								<>
									<div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
										<button 
											className="template-btn"
											onClick={() => setSelectedCategory(null)}
										>
											← 뒤로
										</button>
										<span style={{ fontSize: '1.125rem', fontWeight: '300', letterSpacing: '2px' }}>
											여성 {selectedCategory === 'boots' ? '부츠' : selectedCategory === 'flats' ? '플랫' : selectedCategory === 'heels' ? '힐' : selectedCategory === 'loafers' ? '로퍼' : selectedCategory === 'sandal' ? '샌들' : '스니커즈'} 선택
										</span>
									</div>
									{selectedCategory === 'boots' && (
										<>
											{[1, 2, 3].map((num) => (
												<div 
													key={num}
													className="modal-image-item"
													onClick={() => {
														loadSketchTemplate(`/sketchs/women/boots/${num}.png`, `${num}.png`)
														setShowSubButtons(false)
														setSelectedGender(null)
														setSelectedCategory(null)
													}}
												>
													<img 
														src={`/sketchs/women/boots/${num}.png`}
														alt={`부츠 ${num}`}
														className="modal-image"
													/>
													<span className="modal-label">부츠 {num}</span>
												</div>
											))}
										</>
									)}
									{selectedCategory === 'flats' && (
										<>
											{[1, 2, 3, 4, 5].map((num) => (
												<div 
													key={num}
													className="modal-image-item"
													onClick={() => {
														loadSketchTemplate(`/sketchs/women/flats/${num}.png`, `${num}.png`)
														setShowSubButtons(false)
														setSelectedGender(null)
														setSelectedCategory(null)
													}}
												>
													<img 
														src={`/sketchs/women/flats/${num}.png`}
														alt={`플랫 ${num}`}
														className="modal-image"
													/>
													<span className="modal-label">플랫 {num}</span>
												</div>
											))}
										</>
									)}
									{selectedCategory === 'heels' && (
										<>
											{[1, 2, 3].map((num) => (
												<div 
													key={num}
													className="modal-image-item"
													onClick={() => {
														loadSketchTemplate(`/sketchs/women/heels/${num}.png`, `${num}.png`)
														setShowSubButtons(false)
														setSelectedGender(null)
														setSelectedCategory(null)
													}}
												>
													<img 
														src={`/sketchs/women/heels/${num}.png`}
														alt={`힐 ${num}`}
														className="modal-image"
													/>
													<span className="modal-label">힐 {num}</span>
												</div>
											))}
											{['메리제인', '뮬', '슬릭백', '펌프스'].map((name) => (
												<div 
													key={name}
													className="modal-image-item"
													onClick={() => {
														loadSketchTemplate(`/sketchs/women/heels/${name}.png`, `${name}.png`)
														setShowSubButtons(false)
														setSelectedGender(null)
														setSelectedCategory(null)
													}}
												>
													<img 
														src={`/sketchs/women/heels/${name}.png`}
														alt={name}
														className="modal-image"
													/>
													<span className="modal-label">{name}</span>
												</div>
											))}
										</>
									)}
									{selectedCategory === 'loafers' && (
										<>
											{[1, 2, 3, 4, 5].map((num) => (
												<div 
													key={num}
													className="modal-image-item"
													onClick={() => {
														loadSketchTemplate(`/sketchs/women/loafers/${num}.png`, `${num}.png`)
														setShowSubButtons(false)
														setSelectedGender(null)
														setSelectedCategory(null)
													}}
												>
													<img 
														src={`/sketchs/women/loafers/${num}.png`}
														alt={`로퍼 ${num}`}
														className="modal-image"
													/>
													<span className="modal-label">로퍼 {num}</span>
												</div>
											))}
										</>
									)}
									{selectedCategory === 'sandal' && (
										<>
											{[1, 2, 3, 4].map((num) => (
												<div 
													key={num}
													className="modal-image-item"
													onClick={() => {
														loadSketchTemplate(`/sketchs/women/sandal/${num}.png`, `${num}.png`)
														setShowSubButtons(false)
														setSelectedGender(null)
														setSelectedCategory(null)
													}}
												>
													<img 
														src={`/sketchs/women/sandal/${num}.png`}
														alt={`샌들 ${num}`}
														className="modal-image"
													/>
													<span className="modal-label">샌들 {num}</span>
												</div>
											))}
										</>
									)}
									{selectedCategory === 'sneakers' && (
										<>
											<div 
												className="modal-image-item"
												onClick={() => {
													loadSketchTemplate('/sketchs/women/sneakers/1.png', '1.png')
													setShowSubButtons(false)
													setSelectedGender(null)
													setSelectedCategory(null)
												}}
											>
												<img 
													src="/sketchs/women/sneakers/1.png"
													alt="스니커즈 1"
													className="modal-image"
												/>
												<span className="modal-label">스니커즈 1</span>
											</div>
										</>
									)}
								</>
							)}
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
						<div className="modal-body color-modal-body">
							{/* 색상 선택기 */}
							<div className="color-picker-section">
								<div className="color-picker-label">원하는 색상을 선택하세요</div>
								<div className="color-picker-wrapper">
									<input
										type="color"
										value={(() => {
											const color = selectedColor || '#FF0000'
											// 유효한 6자리 HEX 코드이면 그대로 사용, 아니면 0으로 패딩하여 유효한 색상으로 변환
											if (/^#[0-9A-Fa-f]{1,6}$/i.test(color)) {
												const hexPart = color.slice(1).padEnd(6, '0').substring(0, 6)
												return `#${hexPart.toUpperCase()}`
											}
											return '#FF0000'
										})()}
										onChange={(e) => setSelectedColor(e.target.value.toUpperCase())}
										className="color-picker-input"
									/>
									<div className="color-picker-info">
										<div 
											className="color-preview"
											style={{ 
												backgroundColor: (() => {
													const color = selectedColor || '#FF0000'
													if (/^#[0-9A-Fa-f]{1,6}$/i.test(color)) {
														const hexPart = color.slice(1).padEnd(6, '0').substring(0, 6)
														return `#${hexPart.toUpperCase()}`
													}
													return '#FF0000'
												})()
											}}
										/>
										<input
											type="text"
											value={selectedColor || '#FF0000'}
											onChange={(e) => {
												const value = e.target.value.trim().toUpperCase()
												// #로 시작하는지 확인하고, 없으면 추가
												const hexValue = value.startsWith('#') ? value : `#${value}`
												// 유효한 HEX 문자가 입력되는 동안 업데이트 (최대 7자: #RRGGBB)
												if (/^#[0-9A-Fa-f]{0,6}$/i.test(hexValue)) {
													setSelectedColor(hexValue)
												} else if (value === '' || value === '#') {
													setSelectedColor('#')
												}
											}}
											onBlur={(e) => {
												// 포커스가 벗어날 때 유효성 검사 및 자동 보정
												const value = e.target.value.trim().toUpperCase()
												if (!value || value === '#') {
													setSelectedColor('#FF0000')
												} else {
													let hexValue = value.startsWith('#') ? value : `#${value}`
													// 6자리 미만이면 0으로 채우기
													if (hexValue.length > 1 && hexValue.length < 7) {
														const hexPart = hexValue.slice(1)
														hexValue = `#${hexPart.padEnd(6, '0')}`
													}
													// 유효한 HEX 코드인지 최종 검증
													if (/^#[0-9A-Fa-f]{6}$/i.test(hexValue)) {
														setSelectedColor(hexValue)
													} else {
														// 유효하지 않으면 기본값으로 되돌림
														setSelectedColor('#FF0000')
														alert('유효하지 않은 HEX 코드입니다. 기본 색상으로 설정됩니다.')
													}
												}
											}}
											placeholder="#FF0000"
											className="color-hex-input"
											maxLength={7}
										/>
									</div>
								</div>
							</div>

							{/* 기본 색상 팔레트 */}
							<div className="color-palette-section">
								<div className="color-palette-label">빠른 선택</div>
								<div className="color-grid">
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#FF0000')}
										style={{ backgroundColor: '#FF0000' }}
									>
										<span className="color-label">빨강</span>
									</div>
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#FF4500')}
										style={{ backgroundColor: '#FF4500' }}
									>
										<span className="color-label">주황</span>
									</div>
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#FFD700')}
										style={{ backgroundColor: '#FFD700' }}
									>
										<span className="color-label">노랑</span>
									</div>
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#32CD32')}
										style={{ backgroundColor: '#32CD32' }}
									>
										<span className="color-label">초록</span>
									</div>
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#00CED1')}
										style={{ backgroundColor: '#00CED1' }}
									>
										<span className="color-label">청록</span>
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
										onClick={() => handleColorSelect('#4B0082')}
										style={{ backgroundColor: '#4B0082' }}
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
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#FF1493')}
										style={{ backgroundColor: '#FF1493' }}
									>
										<span className="color-label">분홍</span>
									</div>
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#8B4513')}
										style={{ backgroundColor: '#8B4513' }}
									>
										<span className="color-label">갈색</span>
									</div>
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#000000')}
										style={{ backgroundColor: '#000000' }}
									>
										<span className="color-label">검정</span>
									</div>
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#808080')}
										style={{ backgroundColor: '#808080' }}
									>
										<span className="color-label">회색</span>
									</div>
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#FFFFFF')}
										style={{ backgroundColor: '#FFFFFF', border: '2px solid #ddd' }}
									>
										<span className="color-label" style={{ color: '#333', textShadow: 'none' }}>흰색</span>
									</div>
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#C0C0C0')}
										style={{ backgroundColor: '#C0C0C0' }}
									>
										<span className="color-label" style={{ color: '#333', textShadow: 'none' }}>은색</span>
									</div>
									<div 
										className="color-item"
										onClick={() => handleColorSelect('#FFD700')}
										style={{ backgroundColor: '#FFD700' }}
									>
										<span className="color-label" style={{ color: '#333', textShadow: 'none' }}>금색</span>
									</div>
								</div>
							</div>

							{/* 확인 버튼 */}
							<div className="color-modal-footer">
								<button
									className="color-confirm-btn"
									onClick={() => {
										if (selectedColor) {
											setShowColorModal(false)
										} else {
											// 색상이 선택되지 않았으면 기본값 설정
											setSelectedColor('#FF0000')
											setShowColorModal(false)
										}
									}}
								>
									확인
								</button>
							</div>
						</div>
					</div>
				</div>
			)}


		</div>
	)
}

export default App
