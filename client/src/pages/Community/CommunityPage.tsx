// @ts-nocheck
import { useState } from 'react'
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent,
  Chip, Avatar, Button, TextField, Stack, Divider, IconButton,
  Rating, Badge,
} from '@mui/material'
import {
  Forum, ThumbUp, Comment, Share, Add, Search, TrendingUp,
  Star, EmojiEvents, Verified,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const POSTS = [
  { id: 1, author: 'Rajesh Kumar', avatar: 'RK', role: 'Homeowner', category: 'Material Experience', title: 'AAC Blocks vs Clay Bricks — My Experience After 2 Years', content: 'I built my house with AAC blocks in 2022. Thermal comfort is noticeably better — my AC usage reduced by about 30%. The only challenge was finding a good mason who knew how to work with thin-bed mortar. Overall highly recommended for Kolkata climate.', likes: 142, comments: 38, verified: false, time: '2 days ago', tags: ['AAC Blocks', 'Energy Saving', 'Kolkata'] },
  { id: 2, author: 'Ar. Priya Sharma', avatar: 'PS', role: 'Architect', category: 'Design Tips', title: 'Vastu + Modern Design — How I Reconcile Both', content: 'Many clients ask me to follow vastu while keeping the design modern. The good news: most vastu principles have scientific backing. North-east prayer room gets morning light. South-west master bedroom feels more stable because it is furthest from the entrance. You can follow 80% of vastu without compromising design.', likes: 289, comments: 64, verified: true, time: '5 days ago', tags: ['Vastu', 'Modern Design', 'Architecture'] },
  { id: 3, author: 'Sanjay Mehta', avatar: 'SM', role: 'Builder', category: 'Construction Issues', title: 'Warning: Fake Steel in Market — How to Detect', content: "I caught a supplier supplying TMT bars without proper IS certification. Key checks: 1) Always verify manufacturer's test certificate 2) The rib pattern should match IS 1786 standard 3) Do a bend test — genuine Fe500 should not crack at 4d mandrel 4) Weigh 1 metre sample — 12mm bar should weigh 888g.", likes: 421, comments: 112, verified: false, time: '1 week ago', tags: ['Steel', 'Fraud Prevention', 'Quality Control'] },
  { id: 4, author: 'Dr. Amit Bose', avatar: 'AB', role: 'Structural Engineer', category: 'Q&A', title: 'Can I add an extra floor to my 20-year-old G+1 house?', content: 'Very common question. Short answer: maybe, but only after structural assessment. Key steps: 1) Get an NDT (non-destructive test) on existing columns and beams. 2) Check original foundation design. 3) Core test the existing concrete. If the structure was designed for more floors originally, you are in luck. Otherwise, jacketing columns and strengthening foundation may be needed.', likes: 178, comments: 45, verified: true, time: '2 weeks ago', tags: ['Structural', 'Floor Addition', 'Assessment'] },
]

const CONTRACTORS = [
  { id: 1, name: 'BuildRight Construction', type: 'Civil Contractor', city: 'Kolkata', rating: 4.8, reviews: 127, experience: 18, projects: 243, verified: true, speciality: ['RCC', 'Residential', 'Commercial'], rate: '₹1,800–2,200/sq ft' },
  { id: 2, name: 'Ar. Sunita Designs', type: 'Architect', city: 'Mumbai', rating: 4.9, reviews: 89, experience: 12, projects: 156, verified: true, speciality: ['Modern', 'Vastu', 'Interior'], rate: '₹150/sq ft design fee' },
  { id: 3, name: 'GreenBuild Interiors', type: 'Interior Designer', city: 'Bangalore', rating: 4.7, reviews: 203, experience: 9, projects: 312, verified: true, speciality: ['Modern', 'Scandinavian', 'Modular Kitchen'], rate: '₹80–200/sq ft' },
  { id: 4, name: 'PowerSure Electricals', type: 'Electrical Contractor', city: 'Delhi', rating: 4.6, reviews: 154, experience: 15, projects: 420, verified: false, speciality: ['Residential Wiring', 'Smart Home', 'Solar'], rate: '₹55/sq ft' },
  { id: 5, name: 'AquaFlow Plumbing', type: 'Plumber', city: 'Hyderabad', rating: 4.5, reviews: 98, experience: 11, projects: 280, verified: true, speciality: ['CPVC', 'Sewage', 'Water Harvesting'], rate: '₹40/sq ft' },
]

function CommunityForumTab() {
  const [newPost, setNewPost] = useState(false)
  const [category, setCategory] = useState('all')

  const categories = ['all', 'Material Experience', 'Design Tips', 'Construction Issues', 'Q&A', 'Reviews']
  const filtered = category === 'all' ? POSTS : POSTS.filter(p => p.category === category)

  return (
    <Box>
      <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
        <Box display="flex" gap={0.8} flexWrap="wrap" flex={1}>
          {categories.map(c => (
            <Chip key={c} label={c === 'all' ? `All (${POSTS.length})` : c} onClick={() => setCategory(c)}
              color={category === c ? 'primary' : 'default'} variant={category === c ? 'filled' : 'outlined'} />
          ))}
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setNewPost(true)} sx={{ borderRadius: 2, background: 'linear-gradient(135deg,#6C63FF,#FF6584)' }}>
          New Post
        </Button>
      </Box>

      {newPost && (
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Create New Post</Typography>
          <Stack spacing={2}>
            <TextField label="Post Title" fullWidth size="small" />
            <TextField label="Content" fullWidth multiline rows={4} size="small" />
            <Box display="flex" gap={1}>
              <Button variant="contained" size="small" sx={{ borderRadius: 2 }}>Publish</Button>
              <Button variant="outlined" size="small" onClick={() => setNewPost(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            </Box>
          </Stack>
        </Paper>
      )}

      <Stack spacing={2}>
        {filtered.map(post => (
          <Paper key={post.id} component={motion.div} whileHover={{ y: -2 }} sx={{ p: 3, borderRadius: 3, cursor: 'pointer', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
            <Box display="flex" gap={2} mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>{post.avatar}</Avatar>
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2" fontWeight={700}>{post.author}</Typography>
                  {post.verified && <Verified sx={{ color: 'primary.main', fontSize: 16 }} />}
                  <Chip label={post.role} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>{post.time}</Typography>
                </Box>
                <Chip label={post.category} size="small" color="info" sx={{ mt: 0.3, height: 18, fontSize: '0.65rem' }} />
              </Box>
            </Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>{post.title}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2} sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {post.content}
            </Typography>
            <Box display="flex" gap={1} mb={1} flexWrap="wrap">
              {post.tags.map(t => <Chip key={t} label={t} size="small" variant="outlined" />)}
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <Button size="small" startIcon={<ThumbUp />} sx={{ borderRadius: 2, minWidth: 0 }}>{post.likes}</Button>
              <Button size="small" startIcon={<Comment />} sx={{ borderRadius: 2, minWidth: 0 }}>{post.comments}</Button>
              <Button size="small" startIcon={<Share />} sx={{ borderRadius: 2, minWidth: 0 }}>Share</Button>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

function ContractorMarketTab() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const types = ['all', 'Architect', 'Civil Contractor', 'Interior Designer', 'Electrical Contractor', 'Plumber']
  const filtered = CONTRACTORS.filter(c =>
    (typeFilter === 'all' || c.type === typeFilter) &&
    (search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <Box>
      <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField placeholder="Search by name or city..." size="small" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ color: 'text.disabled', mr: 1 }} /> }} sx={{ minWidth: 250 }} />
          <Box display="flex" gap={0.8} flexWrap="wrap">
            {types.map(t => (
              <Chip key={t} label={t === 'all' ? 'All Types' : t} size="small"
                onClick={() => setTypeFilter(t)} color={typeFilter === t ? 'primary' : 'default'} variant={typeFilter === t ? 'filled' : 'outlined'} />
            ))}
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {filtered.map(c => (
          <Grid item xs={12} md={6} key={c.id}>
            <Card component={motion.div} whileHover={{ y: -4 }} sx={{ borderRadius: 3, '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.2s', height: '100%' }}>
              <CardContent>
                <Box display="flex" gap={2} mb={1.5}>
                  <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main', fontSize: '1.2rem', fontWeight: 700 }}>
                    {c.name.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography variant="subtitle1" fontWeight={700}>{c.name}</Typography>
                      {c.verified && <Verified sx={{ color: 'primary.main', fontSize: 16 }} />}
                    </Box>
                    <Typography variant="caption" color="text.secondary">{c.type} · {c.city}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Star sx={{ color: '#ffc107', fontSize: 16 }} />
                      <Typography variant="subtitle2" fontWeight={700}>{c.rating}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">({c.reviews} reviews)</Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={1} mb={1.5} flexWrap="wrap">
                  {c.speciality.map(s => <Chip key={s} label={s} size="small" variant="outlined" />)}
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Typography variant="caption" color="text.secondary">{c.experience} yrs exp · {c.projects} projects</Typography>
                  <Typography variant="caption" color="primary.main" fontWeight={700}>{c.rate}</Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Button variant="contained" size="small" fullWidth sx={{ borderRadius: 2, background: 'linear-gradient(135deg,#6C63FF,#FF6584)' }}>Contact</Button>
                  <Button variant="outlined" size="small" sx={{ borderRadius: 2, minWidth: 80 }}>Portfolio</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default function CommunityPage() {
  const [tab, setTab] = useState(0)
  return (
    <Box component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800} gutterBottom>Community & Marketplace</Typography>
        <Typography variant="body1" color="text.secondary">Share experiences, discuss construction, and hire verified professionals.</Typography>
      </Box>
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          {['💬 Knowledge Forum', '👷 Hire Professionals'].map((l, i) => (
            <Tab key={i} label={l} sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Paper>
      {tab === 0 && <CommunityForumTab />}
      {tab === 1 && <ContractorMarketTab />}
    </Box>
  )
}
