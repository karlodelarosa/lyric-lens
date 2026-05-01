# LiveLyrics - Premium Worship Presentation System

## 🎯 Core Features

### 1. Dashboard

- Overview of upcoming services and schedules
- Quick stats (total songs, setlists, upcoming events)
- Recently used songs ranked by popularity
- Quick action cards to jump into any workflow

### 2. Song Library

- Full song management with search and filters
- Add/edit/delete songs with lyrics
- Tag-based organization (worship, slow, fast, etc.)
- Usage tracking per song
- Detailed lyric view with sections (verse, chorus, bridge)

### 3. Setlist Builder

- Drag-and-drop song ordering
- Visual setlist construction
- Organize songs into flow sections (Opening, Worship, Response, Closing)
- Save and manage multiple setlists
- Assign setlists to scheduled events

### 4. Schedule Page

- Calendar-based service planner
- Create and manage service schedules
- Attach setlists to specific dates
- Monthly calendar view with event previews
- Upcoming events list view

### 5. **Live Mode** (Main Control Center)

The heart of the application - designed for real-time worship presentation control.

**Layout:**

- **Left Panel**: Song/Slide Navigator
  - Displays active setlist songs
  - Expandable sections per song (verse, chorus, bridge)
  - Click any section to instantly update live screen
  - Visual highlight of currently active section

- **Center Panel**: Live Control View
  - Large live preview of presenter output
  - Current song and section display
  - Live status indicator (broadcasting/not live)
  - Previous/Next navigation controls
  - Real-time preview of what audience sees

- **Right Panel**: Live Settings & Tools
  - **Typography Controls:**
    - Font family selector (Inter, Georgia, Arial, etc.)
    - Font size adjuster (24px - 96px)
    - Line height control
    - Text transform (uppercase, lowercase, title case)
  - **Alignment:**
    - Left, Center, Right text alignment
  - **Background Controls:**
    - Preset gradients (Purple, Blue, Sunset, Ocean)
    - Solid colors (Dark, Black)
    - Custom color picker
    - Real-time background preview

- **Go Live Button:**
  - Opens full-screen Presenter View in new window
  - Sets live broadcasting status
  - Premium gradient styling

### 6. **Presenter View** (Full-Screen Projection)

Clean, distraction-free projection output for audiences.

**Features:**

- Full-screen display (auto-requests fullscreen on open)
- Ultra-minimal design - only lyrics visible
- High-contrast text with shadow for readability
- Real-time sync with Live Mode controls
- Optimized for projectors and LED walls
- No admin UI visible - theater-like presentation

**Updates in real-time when:**

- Operator changes slides in Live Mode
- Typography settings are adjusted
- Background is changed
- Any formatting is modified

## 🎨 Design Features

### Premium SaaS UI

- Clean, modern interface with soft shadows
- Glass-morphism effects on panels (backdrop-blur)
- Smooth transitions and animations
- Gradient accents throughout
- Professional color palette (purple/indigo theme)

### Dark Mode First

- Optimized for live projection environments
- Light mode available for admin tasks
- Smooth theme toggle in sidebar
- Consistent colors across all components

### Responsive & Accessible

- Works on various screen sizes
- Keyboard shortcuts ready (Previous/Next controls)
- High-contrast text for readability
- Professional typography system

## 🚀 How to Use

### Basic Workflow

1. **Setup**: Add songs to your library (Songs page)
2. **Organize**: Create setlists from your songs (Setlists page)
3. **Schedule**: Plan services and attach setlists (Schedule page)
4. **Present**: Go to Live Mode and click "Go Live"
5. **Control**: Use the song navigator to switch slides during service

### Live Presentation

1. Navigate to Live Mode
2. Select your setlist from dropdown
3. Customize typography and background settings
4. Click "Go Live" - new window opens for projection
5. Use left panel to navigate songs/sections
6. Use Previous/Next buttons or click sections directly
7. Audience sees updates instantly in Presenter View

## 🎭 Key Concepts

### Sections

Songs are broken into sections:

- **Verse** (numbered: Verse 1, Verse 2, etc.)
- **Chorus**
- **Bridge**
- **Intro**
- **Outro**

### Flow Sections

Setlists can be organized into flow sections:

- Opening
- Worship
- Response
- Closing

### Live State

The application maintains real-time state including:

- Current setlist being presented
- Active song and section
- Typography settings (font, size, transform)
- Background styling
- Alignment preferences
- Live/offline status

## 🔥 Pro Tips

1. **Prepare in Advance**: Build setlists before services
2. **Preview First**: Always check the live preview before going fullscreen
3. **Use Shortcuts**: Click sections directly instead of using Next/Previous
4. **Customize**: Adjust typography for your venue's screen/projector
5. **Dark Backgrounds**: Use darker backgrounds for better text readability
6. **Test Run**: Do a tech rehearsal to ensure smooth operation

## 🛠️ Technical Stack

- **React 18** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS v4** for styling
- **Radix UI** components for accessibility
- **React DnD** for drag-and-drop
- **date-fns** for date handling
- **next-themes** for dark/light mode
- **Motion** for animations
- **Lucide React** for icons

---

Built with premium attention to detail for worship teams worldwide.
