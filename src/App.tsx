import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Crop, ImagePlus,
  Info, LoaderCircle, PawPrint, RefreshCw, ShieldCheck, Sparkles, Upload, X, WandSparkles, BadgeCheck,
} from 'lucide-react'
import {
  artStyles, colorMoodOptions, cropOptions, demoPet, getStyleDefinition, typeMoodOptions,
  type StyleConfig,
} from './style-system'
import { formats, type FormatId } from './format-system'

type Stage = 'upload' | 'format' | 'style' | 'text' | 'generating' | 'results'
type GeneratedImages = string[]

const stepOrder: Stage[] = ['upload', 'format', 'style', 'text']
const steps = [
  { id: 'upload', label: 'Foto' }, { id: 'format', label: 'Format' },
  { id: 'style', label: 'Stil' }, { id: 'text', label: 'Texte' },
]

function App() {
  const [stage, setStage] = useState<Stage>('upload')
  const [photo, setPhoto] = useState<string | null>(null)
  const [format, setFormat] = useState<FormatId>('a3')
  const [petName, setPetName] = useState('LUNA')
  const [subtitle, setSubtitle] = useState('Golden Retriever')
  const [detail, setDetail] = useState('Seit 2021')
  const [quote, setQuote] = useState('Sonnenkind auf vier Pfoten')
  const [style, setStyle] = useState<StyleConfig>({
    artStyle: 'watercolor',
    crop: 'balanced',
    colorMood: 'original',
    typeMood: 'elegant',
  })
  const [selected, setSelected] = useState<number | null>(null)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const currentStep = Math.max(0, stepOrder.indexOf(stage))
  const img = photo || demoPet

  const loadFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(String(reader.result))
    reader.readAsDataURL(file)
  }

  const next = () => {
    if (stage === 'upload') setStage('format')
    else if (stage === 'format') setStage('style')
    else if (stage === 'style') setStage('text')
    else if (stage === 'text') setStage('generating')
  }

  if (stage === 'generating') return <Generating
    photo={photo}
    format={format}
    style={style}
    petName={petName}
    subtitle={subtitle}
    detail={detail}
    quote={quote}
    onBack={() => setStage('text')}
    onDone={(images) => {
      setGeneratedImages(images)
      setSelected(null)
      setStage('results')
    }}
  />
  if (stage === 'results') return <Results images={generatedImages} format={format} style={style} petName={petName} subtitle={subtitle} detail={detail} quote={quote} selected={selected} setSelected={setSelected} onBack={() => setStage('text')} onRegenerate={() => setStage('generating')} />

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark"><PawPrint size={20}/></span><span>petster</span></a>
        <div className="lab-pill"><span></span> POSTER LAB <b>INTERN</b></div>
        <button className="avatar">MK</button>
      </header>

      <main className="studio">
        <div className="intro">
          <div><p className="eyebrow">NEUES PROJEKT</p><h1>Dein Tier. Dein Kunstwerk.</h1><p>Gestalte ein einzigartiges Poster – wir kümmern uns um den Wow-Moment.</p></div>
          <div className="autosave"><CheckCircle2 size={16}/> Entwurf gespeichert</div>
        </div>

        <nav className="stepper" aria-label="Fortschritt">
          {steps.map((s, i) => <div key={s.id} className={`step ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}>
            <button onClick={() => i <= currentStep && setStage(s.id as Stage)}>{i < currentStep ? <Check size={16}/> : i + 1}</button>
            <span>{s.label}</span>{i < steps.length - 1 && <i/>}
          </div>)}
        </nav>

        <section className="workspace">
          <div className="workspace-head"><span>0{currentStep + 1}</span><div><h2>{stageTitle(stage)}</h2><p>{stageDescription(stage)}</p></div></div>
          {stage === 'upload' && <UploadStage photo={photo} img={img} inputRef={inputRef} loadFile={loadFile} clear={() => setPhoto(null)} />}
          {stage === 'format' && <FormatStage format={format} setFormat={setFormat}/>} 
          {stage === 'style' && <StyleStage style={style} setStyle={setStyle}/>} 
          {stage === 'text' && <TextStage values={{petName, subtitle, detail, quote}} setters={{setPetName, setSubtitle, setDetail, setQuote}}/>}
        </section>

        <footer className="actions">
          <button className="back" disabled={currentStep === 0} onClick={() => setStage(stepOrder[currentStep - 1])}><ArrowLeft size={18}/> Zurück</button>
          <div className="privacy"><ShieldCheck size={17}/><span><b>Dein Foto bleibt privat.</b><br/>Es wird nur für dein Poster verwendet.</span></div>
          <button className="primary" onClick={next}>{stage === 'text' ? <><Sparkles size={18}/> 4 Poster erstellen</> : <>Weiter <ArrowRight size={18}/></>}</button>
        </footer>
      </main>
    </div>
  )
}

function stageTitle(stage: Stage) {
  return ({ upload: 'Wähle dein schönstes Foto', format: 'Wähle dein Posterformat', style: 'Gib deinem Poster Charakter', text: 'Mach es persönlich' } as Record<string,string>)[stage]
}
function stageDescription(stage: Stage) {
  return ({ upload: 'Ein klares Portrait mit gut sichtbarem Gesicht funktioniert am besten.', format: 'Vergleiche die drei Größen direkt in derselben Raumsituation.', style: 'Kombiniere kuratierte Optionen für ein stimmiges Ergebnis.', text: 'Diese Texte werden exakt in deine Poster integriert.' } as Record<string,string>)[stage]
}

function UploadStage({photo,img,inputRef,loadFile,clear}:{photo:string|null,img:string,inputRef:React.RefObject<HTMLInputElement|null>,loadFile:(f?:File)=>void,clear:()=>void}) {
  return <div className="upload-grid">
    <div className={`dropzone ${photo ? 'has-photo' : ''}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();loadFile(e.dataTransfer.files[0])}}>
      {photo ? <><img src={img}/><div className="photo-tools"><button><Crop size={16}/> Zuschneiden</button><button onClick={clear}><X size={16}/></button></div></> : <>
        <div className="upload-icon"><ImagePlus size={29}/></div><h3>Foto hier ablegen</h3><p>oder wähle eine Datei von deinem Gerät</p>
        <button onClick={()=>inputRef.current?.click()}><Upload size={17}/> Foto auswählen</button><small>JPG, PNG oder WebP · max. 20 MB</small>
      </>}
      <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>loadFile(e.target.files?.[0])}/>
    </div>
    <aside className="quality-card"><div className="card-title"><Sparkles size={17}/> Darauf kommt es an</div>
      {[['Scharfes Tiergesicht','Augen, Nase und Fell sollten gut erkennbar sein.'],['Natürliches Licht','Vermeide starke Schatten oder Gegenlicht.'],['Nur ein Tier','So können wir die Ähnlichkeit am besten bewahren.']].map((x,i)=><div className="tip" key={x[0]}><span>0{i+1}</span><div><b>{x[0]}</b><p>{x[1]}</p></div></div>)}
      <div className="hint"><Info size={17}/><p>Keine Sorge: Den Hintergrund entfernen und das Motiv freistellen übernehmen wir.</p></div>
    </aside>
  </div>
}

function FormatStage({format,setFormat}:{format:FormatId,setFormat:(s:FormatId)=>void}) {
  return <><div className="format-grid">{formats.map(f=><button key={f.id} type="button" onClick={()=>setFormat(f.id)} aria-pressed={format===f.id} className={`format-card ${format===f.id?'selected':''}`}><div className="format-room"><img src={f.roomPreview} alt={`${f.size} als Größenvergleich in einem Wohnzimmer`}/><span>{f.size.split(' · ')[0]}</span></div><span className="radio">{format===f.id&&<Check size={12}/>}</span><div className="format-copy"><h3>{f.name}</h3><b>{f.size}</b><small>{f.useCase}</small></div></button>)}</div><div className="format-note"><Info size={17}/><span><b>So groß wirkt dein Poster.</b> Alle drei Beispiele zeigen denselben Raum und dasselbe Motiv – nur die reale Postergröße verändert sich.</span></div></>
}

function StyleStage({style,setStyle}:{style:StyleConfig,setStyle:(value:StyleConfig)=>void}) {
  const selectedStyle = getStyleDefinition(style.artStyle)
  const selectedCrop = cropOptions.find((item) => item.id === style.crop) ?? cropOptions[1]
  const selectedColor = colorMoodOptions.find((item) => item.id === style.colorMood) ?? colorMoodOptions[0]
  const selectedType = typeMoodOptions.find((item) => item.id === style.typeMood) ?? typeMoodOptions[0]
  const selectedPalette = selectedStyle.previewPalettes[style.colorMood]
  const paletteStyle = {
    '--swatch-1': selectedPalette.colors[0],
    '--swatch-2': selectedPalette.colors[1],
    '--swatch-3': selectedPalette.colors[2],
    '--preview-filter': selectedPalette.filter,
    '--preview-overlay': selectedPalette.overlay,
  } as CSSProperties
  return <div className="style-builder-v2">
    <div className="style-controls-v2">
      <fieldset className="style-pack-fieldset">
        <legend>01 · Stilpaket</legend>
        <div className="style-pack-grid">
          {artStyles.map((item)=><button
            type="button"
            key={item.id}
            className={`style-pack-card ${style.artStyle===item.id?'selected':''}`}
            onClick={()=>setStyle({...style,artStyle:item.id})}
            aria-pressed={style.artStyle===item.id}
          >
            <span className="style-pack-image"><img src={item.image} alt=""/><em>{item.badge}</em></span>
            <span className="style-pack-copy"><b>{item.name}</b><small>{item.description}</small></span>
            <span className="style-pack-check">{style.artStyle===item.id&&<Check size={13}/>}</span>
          </button>)}
        </div>
      </fieldset>

      <div className="customizing-head"><div><span>02 · Feinabstimmung</span><b>Jetzt wird die Wirkung sichtbar angepasst</b></div><small>Jede Auswahl aktualisiert die Vorschau rechts sofort.</small></div>
      <div className="fine-tuning-grid">
        <fieldset>
          <legend>Motivgröße</legend>
          <div className="choice-stack">{cropOptions.map((item)=><button type="button" key={item.id} className={style.crop===item.id?'selected':''} aria-pressed={style.crop===item.id} onClick={()=>setStyle({...style,crop:item.id})}><span><b>{item.label}</b><small>{item.hint}</small></span>{style.crop===item.id&&<Check size={13}/>}</button>)}</div>
        </fieldset>
        <fieldset>
          <legend>Farbwelt</legend>
          <div className="color-choice-grid">{colorMoodOptions.map((item)=>{
            const optionPalette = selectedStyle.previewPalettes[item.id]
            const optionStyle = {
              '--choice-1': optionPalette.colors[0],
              '--choice-2': optionPalette.colors[1],
              '--choice-3': optionPalette.colors[2],
            } as CSSProperties
            return <button type="button" key={item.id} style={optionStyle} className={`${style.colorMood===item.id?'selected':''} mood-${item.id}`} aria-pressed={style.colorMood===item.id} onClick={()=>setStyle({...style,colorMood:item.id})}><i><span/><span/><span/></i><span>{item.label}</span></button>
          })}</div>
        </fieldset>
        <fieldset>
          <legend>Schriftwirkung</legend>
          <div className="type-choice-grid">{typeMoodOptions.map((item)=><button type="button" key={item.id} className={`${style.typeMood===item.id?'selected':''} type-${item.id}`} aria-pressed={style.typeMood===item.id} onClick={()=>setStyle({...style,typeMood:item.id})}><b>{item.sample}</b><span>{item.label}</span></button>)}</div>
        </fieldset>
      </div>

      <div className="selection-recap"><span>Deine Kombination</span><div><b>{selectedStyle.shortName}</b><b>{selectedCrop.label}</b><b>{selectedColor.label}</b><b>{selectedType.label}</b></div></div>
      <div className="curation-note"><BadgeCheck size={17}/><span><b>Fünf klar getrennte Stilpakete.</b> Motivgröße, Farbwelt und Schriftwirkung bleiben bis zum Ergebnis verbindlich und werden unabhängig voneinander angewendet.</span></div>
    </div>

    <aside className="live-preview-v2" style={paletteStyle}>
      <div className="preview-heading"><div><p className="eyebrow">LIVE-STILPROBE</p><h3>{selectedStyle.name}</h3></div><span><WandSparkles size={14}/> Beispielmotiv</span></div>
      <div className={`preview-art-v2 style-${selectedStyle.id} crop-${style.crop} mood-${style.colorMood} type-${style.typeMood}`}>
        <img key={selectedStyle.id} src={selectedStyle.image} alt={`Golden Retriever als ${selectedStyle.name}`}/>
        <div className="preview-live-values"><span>{selectedCrop.label}</span><span>{selectedColor.label}</span><span>{selectedType.label}</span></div>
        <div className="preview-type-sample"><small>STILPROBE</small><b>Luna</b><span>{selectedStyle.shortName}</span></div>
        <div className="preview-style-lock"><ShieldCheck size={13}/> Stil fest verknüpft</div>
      </div>
      <div className="selected-style-meta">
        <div><span>Passt besonders zu</span><b>{selectedStyle.bestFor}</b></div>
        <div className="meta-swatches"><i/><i/><i/></div>
      </div>
      <div className="preview-foot"><Info size={15}/><span>Beispielhund und Mustertext zeigen die Wirkung. Dein finales Poster wird erst nach der Generierung enthüllt.</span></div>
    </aside>
  </div>
}

function TextStage({values,setters}:{values:Record<string,string>,setters:Record<string,(v:string)=>void>}) {
  const fields=[['Tiername','petName',setters.setPetName,24],['Rasse oder Untertitel','subtitle',setters.setSubtitle,40],['Kleine Zusatzinfo','detail',setters.setDetail,32],['Kurzer Spruch','quote',setters.setQuote,54]] as const
  return <div className="text-layout"><div className="form-fields">{fields.map(([label,key,set,max])=><label key={key}><span>{label}{key==='petName'&&<b>PFLICHTFELD</b>}</span><div><input value={values[key]} maxLength={max} onChange={e=>set(e.target.value)}/><small>{values[key].length}/{max}</small></div></label>)}</div><aside className="text-rules"><Sparkles size={20}/><h3>Text-Check inklusive</h3><p>Wir prüfen jeden Buchstaben, bevor du deine Poster siehst.</p><ul><li><Check/>Schreibweise & Umlaute</li><li><Check/>Lesbarkeit & Kontrast</li><li><Check/>Sichere Abstände</li></ul></aside></div>
}

async function imageUrlToDataUrl(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Das Beispielbild konnte nicht geladen werden.')
  const blob = await response.blob()
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Das Bild konnte nicht gelesen werden.'))
    reader.readAsDataURL(blob)
  })
}

async function optimizeReferenceImage(dataUrl: string) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('Das Referenzbild konnte nicht verarbeitet werden.'))
    element.src = dataUrl
  })
  const maxEdge = 1024
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Das Referenzbild konnte nicht verarbeitet werden.')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.86)
}

function Generating({
  photo, format, style, petName, subtitle, detail, quote, onBack, onDone,
}:{
  photo:string|null
  format:FormatId
  style:StyleConfig
  petName:string
  subtitle:string
  detail:string
  quote:string
  onBack:()=>void
  onDone:(images:GeneratedImages)=>void
}) {
  const [progress,setProgress]=useState(12)
  const [label,setLabel]=useState('Motiv wird analysiert')
  const [error,setError]=useState<string|null>(null)
  const [attempt,setAttempt]=useState(0)
  const styleDefinition = getStyleDefinition(style.artStyle)

  useEffect(()=>{
    let cancelled = false
    setError(null)
    setProgress(12)
    setLabel('Motiv wird analysiert')

    const timer = window.setInterval(()=>setProgress(p=>{
      const next = Math.min(88,p+2)
      if(next>35)setLabel('Zwei Kompositionen entstehen')
      if(next>72)setLabel('Layout & Texte werden gesetzt')
      return next
    }),900)

    const generate = async () => {
      try {
        const sourceImage = photo ?? await imageUrlToDataUrl(demoPet)
        const image = await optimizeReferenceImage(sourceImage)
        const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''
        const response = await fetch(`${apiBase}/api/v1/generations`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            image,
            config: {
              format,
              variants: 2,
              style,
              copy: {name:petName,subtitle,detail,quote},
            },
          }),
        })
        const result = await response.json() as {images?:Array<{dataUrl:string}>,error?:{message?:string}}
        if (!response.ok) throw new Error(result.error?.message || 'Die Bildgenerierung ist fehlgeschlagen.')
        const images = result.images?.map((item) => item.dataUrl) ?? []
        if (!images.length) throw new Error('Es wurden keine Bilder zurückgegeben.')
        if (cancelled) return
        window.clearInterval(timer)
        setProgress(100)
        setLabel('Deine Poster sind fertig')
        window.setTimeout(()=>!cancelled&&onDone(images),450)
      } catch (cause) {
        if (cancelled) return
        window.clearInterval(timer)
        setError(cause instanceof Error ? cause.message : 'Die Bildgenerierung ist fehlgeschlagen.')
      }
    }

    void generate()
    return()=>{cancelled=true;window.clearInterval(timer)}
  },[attempt])

  return <div className="generation"><a className="brand"><span className="brand-mark"><PawPrint size={20}/></span><span>petster</span></a><div className="gen-orbit"><div><PawPrint size={34}/></div><i/><i/><i/></div><p className="eyebrow">DEINE POSTER ENTSTEHEN</p><h1>{error?'Das hat noch nicht geklappt.':<>Ein bisschen Magie braucht<br/>einen kleinen Moment.</>}</h1><p className="gen-copy">{error||<>Zwei Varianten werden inklusive Typografie im Stil <b>{styleDefinition.name}</b> aufgebaut und geprüft.</>}</p><div className="progress"><span style={{width:`${progress}%`}}/><b>{progress}%</b></div>{error?<div className="gen-status"><button className="primary" onClick={()=>setAttempt(value=>value+1)}><RefreshCw size={17}/> Erneut versuchen</button><button className="back" onClick={onBack}><ArrowLeft size={17}/> Angaben ändern</button></div>:<div className="gen-status"><LoaderCircle className="spin" size={17}/>{label}</div>}<small>Stilprofil und Schreibweise gesperrt · Bitte schließe dieses Fenster nicht.</small></div>
}

const resultVariants = [
  { name: 'Galerie', note: 'Ruhig & klassisch' },
  { name: 'Editorial', note: 'Mit mehr Weißraum' },
]

function Results({images,format,style,petName,subtitle,detail,quote,selected,setSelected,onBack,onRegenerate}:{images:GeneratedImages,format:string,style:StyleConfig,petName:string,subtitle:string,detail:string,quote:string,selected:number|null,setSelected:(n:number|null)=>void,onBack:()=>void,onRegenerate:()=>void}) {
  const selectedStyle = getStyleDefinition(style.artStyle)
  return <div className="results-page">
    <header className="topbar"><a className="brand"><span className="brand-mark"><PawPrint size={20}/></span><span>petster</span></a><div className="lab-pill"><span/> POSTER LAB <b>INTERN</b></div><button className="avatar">MK</button></header>
    <main className="results-main">
      <div className="results-head"><div><p className="eyebrow"><CheckCircle2/> 2 VON 2 POSTERN ERSTELLT</p><h1>Da ist dein Wow-Moment.</h1><p>Beide Varianten wurden inklusive Text im Stil <b>{selectedStyle.name}</b> generiert.</p></div><button className="outline" onClick={onBack}><ArrowLeft size={17}/> Angaben ändern</button></div>
      <div className="result-style-bar"><div><img src={selectedStyle.image} alt=""/><span><small>GEWÄHLTER STIL</small><b>{selectedStyle.name}</b></span></div><p><ShieldCheck size={15}/> Vorschau und Ergebnisse verwenden dasselbe Stilprofil.</p></div>
      <div className="posters">{resultVariants.map((variant,i)=><button className={`poster-choice ${selected===i?'selected':''}`} key={variant.name} onClick={()=>setSelected(i)}>
        <div className={`poster poster-format-${format.replace(':', '')} styled-poster style-${selectedStyle.id} mood-${style.colorMood} type-${style.typeMood} crop-${style.crop} result-variant-${i+1}`}>
          <img src={images[i] ?? selectedStyle.image} alt={`${petName} – ${selectedStyle.name}, Variante ${i+1}`}/>
        </div>
        <div className="choice-label"><span>{selected===i?<Check/>:String(i+1).padStart(2,'0')}</span><div><b>{variant.name}</b><small>{variant.note}</small></div></div>
      </button>)}</div>
      <div className="result-actions"><button className="back" onClick={onRegenerate}><RefreshCw size={17}/> Zwei neue Varianten</button><div className="result-hint"><Info size={15}/> Bitte prüfe die Schreibweise vor der Auswahl.</div><button className="primary" disabled={selected===null}>Variante auswählen <ArrowRight size={18}/></button></div>
    </main>
  </div>
}

export default App
