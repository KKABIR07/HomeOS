// @ts-nocheck
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
  Divider,
  Avatar,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FavoriteIcon from '@mui/icons-material/Favorite'
import GroupsIcon from '@mui/icons-material/Groups'
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects'
import SecurityIcon from '@mui/icons-material/Security'
import SpeedIcon from '@mui/icons-material/Speed'
import PublicIcon from '@mui/icons-material/Public'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TwitterIcon from '@mui/icons-material/Twitter'
import GitHubIcon from '@mui/icons-material/GitHub'
import InstagramIcon from '@mui/icons-material/Instagram'
import EmailIcon from '@mui/icons-material/Email'
import YouTubeIcon from '@mui/icons-material/YouTube'

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const stats = [
  { value: '12,000+', label: 'Happy Users', color: '#6C63FF' },
  { value: '18,900+', label: 'Active Projects', color: '#FF6584' },
  { value: '340+', label: 'Partner Architects', color: '#4FC3F7' },
  { value: '2,400+', label: 'AI Floor Plans', color: '#66BB6A' },
  { value: '47', label: 'Countries', color: '#FFB74D' },
  { value: '4.9★', label: 'Average Rating', color: '#CE93D8' },
]

const values = [
  {
    icon: <EmojiObjectsIcon />,
    title: 'Innovation First',
    description:
      'We push the boundaries of AI and architecture to give you tools that didn\'t exist before. Every feature ships with a reason.',
    color: '#6C63FF',
  },
  {
    icon: <FavoriteIcon />,
    title: 'Human-Centered Design',
    description:
      'Technology should serve people, not the other way around. Every pixel and interaction is crafted around your needs.',
    color: '#FF6584',
  },
  {
    icon: <SecurityIcon />,
    title: 'Privacy & Trust',
    description:
      'Your designs, your data. We never share, sell, or compromise your intellectual property under any circumstances.',
    color: '#4FC3F7',
  },
  {
    icon: <GroupsIcon />,
    title: 'Community Driven',
    description:
      'Our roadmap is shaped by you. The best ideas come from our users, and we build accordingly.',
    color: '#66BB6A',
  },
  {
    icon: <SpeedIcon />,
    title: 'Speed & Quality',
    description:
      'Fast doesn\'t mean careless. We obsess over performance so your workflow never waits on us.',
    color: '#FFB74D',
  },
  {
    icon: <PublicIcon />,
    title: 'Global Accessibility',
    description:
      'Great architecture tools shouldn\'t be gatekept. We\'re committed to making HouseOS affordable worldwide.',
    color: '#CE93D8',
  },
]

const team = [
  {
    name: 'Masum Kabir Biswas',
    role: 'Founder & CEO',
    bio: 'Full-stack engineer and AI architect. Building the future of residential design with code and curiosity.',
    avatar: 'MK',
    color: '#6C63FF',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Sara Mitchell',
    role: 'Head of Product',
    bio: 'Former architect turned product strategist. Bridges the gap between design intuition and digital tools.',
    avatar: 'SM',
    color: '#FF6584',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Jason Park',
    role: 'Lead AI Engineer',
    bio: 'ML researcher specializing in generative models for spatial design and structural optimization.',
    avatar: 'JP',
    color: '#4FC3F7',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Priya Nair',
    role: 'UX Design Lead',
    bio: 'Passionate about making complex tools feel simple. Previously at Figma and Notion.',
    avatar: 'PN',
    color: '#66BB6A',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Carlos Rivera',
    role: 'Backend Architect',
    bio: 'Distributed systems expert who keeps HouseOS fast, secure, and always online.',
    avatar: 'CR',
    color: '#FFB74D',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Aisha Thompson',
    role: 'Community & Growth',
    bio: 'Architect by training, community builder by calling. Connects our platform with the people who love it.',
    avatar: 'AT',
    color: '#CE93D8',
    linkedin: '#',
    twitter: '#',
  },
]

const timeline = [
  {
    year: '2022',
    title: 'The Idea',
    description:
      'Frustrated by expensive and outdated architecture software, we started building a better way. Just two engineers and a shared doc.',
  },
  {
    year: '2023',
    title: 'First Beta',
    description:
      '200 beta users tested our first AI floor plan generator. The feedback was overwhelming — people wanted more.',
  },
  {
    year: '2024',
    title: 'Public Launch',
    description:
      'HouseOS launched publicly with 6 core features. 5,000 sign-ups in the first week. The community grew fast.',
  },
  {
    year: '2025',
    title: 'Global Expansion',
    description:
      '12,000 users across 47 countries. We expanded the Architect Marketplace and launched enterprise plans for firms.',
  },
  {
    year: '2026',
    title: 'The Future',
    description:
      'Real-time collaboration, AR walkthroughs, structural AI analysis, and deeper integrations are on the horizon.',
  },
]

const footerLinks = {
  Product: [
    { label: 'AI Floor Plans', path: '/register' },
    { label: '3D Visualization', path: '/register' },
    { label: 'AI Designer', path: '/register' },
    { label: 'Cost Estimator', path: '/register' },
    { label: 'Interior Studio', path: '/register' },
    { label: 'Architect Marketplace', path: '/register' },
    { label: 'Site Intelligence', path: '/register' },
    { label: 'Construction Manager', path: '/register' },
    { label: 'Smart Home', path: '/register' },
  ],
  Company: [
    { label: 'About Us', path: '/about' },
    { label: 'Our Team', path: '/about#team' },
    { label: 'Careers', path: '#' },
    { label: 'Press Kit', path: '#' },
    { label: 'Partners', path: '#' },
    { label: 'Investors', path: '#' },
    { label: 'Contact Us', path: '#' },
  ],
  Resources: [
    { label: 'Documentation', path: '#' },
    { label: 'API Reference', path: '#' },
    { label: 'Blog', path: '#' },
    { label: 'Tutorials', path: '#' },
    { label: 'Community Forum', path: '/register' },
    { label: 'Webinars', path: '#' },
    { label: 'Templates', path: '#' },
    { label: 'Changelog', path: '#' },
  ],
  Support: [
    { label: 'Help Center', path: '#' },
    { label: 'Live Chat', path: '#' },
    { label: 'System Status', path: '#' },
    { label: 'Report a Bug', path: '#' },
    { label: 'Feature Requests', path: '#' },
    { label: 'Security', path: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', path: '#' },
    { label: 'Terms of Service', path: '#' },
    { label: 'Cookie Policy', path: '#' },
    { label: 'GDPR', path: '#' },
    { label: 'Acceptable Use', path: '#' },
    { label: 'Licenses', path: '#' },
  ],
}

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A0C10 0%, #0D0F18 50%, #0A0C10 100%)',
        color: 'white',
        overflowX: 'hidden',
      }}
    >
      {/* ── HERO ── */}
      <Container maxWidth="lg" sx={{ pt: 14, pb: 10 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', maxWidth: 820, mx: 'auto' }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 6 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HomeWorkIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              HouseOS
            </Typography>
          </Box>

          <Chip
            label="Our Story"
            icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              mb: 3,
              background: 'rgba(108,99,255,0.15)',
              color: '#8B85FF',
              border: '1px solid rgba(108,99,255,0.3)',
              fontWeight: 600,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4.5rem' },
              fontWeight: 900,
              lineHeight: 1.1,
              mb: 3,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #C8C4FF 50%, #FF6584 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            We're building the future of home design
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 400,
              lineHeight: 1.8,
              mb: 5,
              maxWidth: 640,
              mx: 'auto',
            }}
          >
            HouseOS was born from a simple belief: designing your dream home should be
            empowering, accessible, and intelligent — not frustrating, expensive, or reserved for the elite.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/register')}
              component={motion.button}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5750D9, #7A73EE)',
                  boxShadow: '0 12px 40px rgba(108,99,255,0.5)',
                },
              }}
            >
              Start Building Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderColor: 'rgba(108,99,255,0.4)',
                color: 'rgba(255,255,255,0.8)',
                '&:hover': {
                  borderColor: '#6C63FF',
                  background: 'rgba(108,99,255,0.08)',
                },
              }}
            >
              See the Platform
            </Button>
          </Box>
        </Box>
      </Container>

      {/* ── STATS ── */}
      <Box sx={{ py: 8, background: 'rgba(108,99,255,0.04)', borderTop: '1px solid rgba(108,99,255,0.08)', borderBottom: '1px solid rgba(108,99,255,0.08)' }}>
        <Container maxWidth="lg">
          <Grid
            container
            spacing={3}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((s) => (
              <Grid item xs={6} sm={4} md={2} key={s.label}>
                <Box
                  component={motion.div}
                  variants={itemVariants}
                  sx={{ textAlign: 'center' }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 900, color: s.color, letterSpacing: '-0.02em', mb: 0.5 }}
                  >
                    {s.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                    {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── MISSION + VISION ── */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Chip
                label="Our Mission"
                sx={{
                  mb: 3,
                  background: 'rgba(108,99,255,0.12)',
                  color: '#8B85FF',
                  border: '1px solid rgba(108,99,255,0.25)',
                  fontWeight: 600,
                }}
              />
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.8rem', md: '2.5rem' }, lineHeight: 1.2 }}
              >
                Democratize professional{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  architecture tools
                </Box>
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, mb: 2 }}
              >
                Traditional architecture software costs thousands of dollars and requires years
                of training. Meanwhile, millions of people dream of building their ideal home
                but have no accessible way to start.
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.9 }}
              >
                Our mission is to put professional-grade design, estimation, and collaboration
                tools in the hands of every homeowner, builder, and dreamer — at a fraction
                of the cost and without the steep learning curve.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Card
                sx={{
                  p: 4,
                  background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(255,101,132,0.06))',
                  border: '1px solid rgba(108,99,255,0.2)',
                  borderRadius: '20px',
                  mb: 3,
                }}
              >
                <Chip
                  label="Our Vision"
                  size="small"
                  sx={{
                    mb: 2,
                    background: 'rgba(255,101,132,0.12)',
                    color: '#FF6584',
                    border: '1px solid rgba(255,101,132,0.25)',
                    fontWeight: 600,
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  A world where anyone can build their dream
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
                  We envision a future where AI handles the complexity so you can focus on the
                  creativity. Where geographical and financial barriers no longer dictate
                  who gets to design beautiful, functional spaces.
                </Typography>
              </Card>

              <Card
                sx={{
                  p: 4,
                  background: 'rgba(17,19,24,0.8)',
                  border: '1px solid rgba(108,99,255,0.1)',
                  borderRadius: '20px',
                }}
              >
                <Chip
                  label="Our Promise"
                  size="small"
                  sx={{
                    mb: 2,
                    background: 'rgba(79,195,247,0.12)',
                    color: '#4FC3F7',
                    border: '1px solid rgba(79,195,247,0.25)',
                    fontWeight: 600,
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Built with architects, for everyone
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
                  Every feature is co-developed with licensed architects and real homeowners.
                  We don't guess what you need — we build alongside you.
                </Typography>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── VALUES ── */}
      <Box sx={{ py: 12, background: 'rgba(108,99,255,0.03)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
            >
              What we stand for
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
              The principles that drive every decision at HouseOS
            </Typography>
          </Box>

          <Grid
            container
            spacing={3}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((v) => (
              <Grid item xs={12} sm={6} md={4} key={v.title}>
                <Card
                  component={motion.div}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  sx={{
                    p: 3,
                    height: '100%',
                    background: 'rgba(17,19,24,0.8)',
                    border: '1px solid rgba(108,99,255,0.1)',
                    borderRadius: '16px',
                    '&:hover': {
                      border: `1px solid ${v.color}33`,
                      boxShadow: `0 8px 32px ${v.color}22`,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      background: `${v.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: v.color,
                      mb: 2,
                      '& .MuiSvgIcon-root': { fontSize: 24 },
                    }}
                  >
                    {v.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {v.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                    {v.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── TIMELINE ── */}
      <Container maxWidth="md" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
          >
            How we got here
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
            The milestones that shaped HouseOS
          </Typography>
        </Box>

        <Box sx={{ position: 'relative' }}>
          {/* vertical line */}
          <Box
            sx={{
              position: 'absolute',
              left: { xs: 20, md: '50%' },
              top: 0,
              bottom: 0,
              width: 2,
              background: 'linear-gradient(180deg, #6C63FF 0%, #FF6584 100%)',
              opacity: 0.3,
              transform: { md: 'translateX(-50%)' },
            }}
          />

          {timeline.map((item, idx) => (
            <Box
              key={item.year}
              component={motion.div}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: idx % 2 === 0 ? 'row' : 'row-reverse' },
                mb: 6,
                gap: 4,
                position: 'relative',
              }}
            >
              {/* dot */}
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: 12, md: 'calc(50% - 12px)' },
                  top: 8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                  border: '3px solid #0A0C10',
                  zIndex: 1,
                }}
              />

              <Box
                sx={{
                  ml: { xs: 8, md: 0 },
                  width: { md: '45%' },
                  ...(idx % 2 === 0
                    ? { mr: { md: 'auto' }, pr: { md: 6 } }
                    : { ml: { md: 'auto' }, pl: { md: 6 } }),
                }}
              >
                <Card
                  sx={{
                    p: 3,
                    background: 'rgba(17,19,24,0.85)',
                    border: '1px solid rgba(108,99,255,0.15)',
                    borderRadius: '16px',
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: '#6C63FF', fontWeight: 700, letterSpacing: 2 }}
                  >
                    {item.year}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                    {item.description}
                  </Typography>
                </Card>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>

      {/* ── TEAM ── */}
      <Box id="team" sx={{ py: 12, background: 'rgba(108,99,255,0.03)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}
            >
              The team behind HouseOS
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
              Builders, architects, engineers, and dreamers
            </Typography>
          </Box>

          <Grid
            container
            spacing={3}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {team.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.name}>
                <Card
                  component={motion.div}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  sx={{
                    p: 3,
                    background: 'rgba(17,19,24,0.8)',
                    border: '1px solid rgba(108,99,255,0.1)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    '&:hover': {
                      border: `1px solid ${member.color}33`,
                      boxShadow: `0 8px 32px ${member.color}22`,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      background: `linear-gradient(135deg, ${member.color}, ${member.color}88)`,
                      fontSize: '1.2rem',
                      fontWeight: 700,
                    }}
                  >
                    {member.avatar}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {member.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: member.color, fontWeight: 600, mb: 1.5 }}
                  >
                    {member.role}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, mb: 2 }}
                  >
                    {member.bio}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Box
                      component="a"
                      href={member.linkedin}
                      sx={{
                        color: 'rgba(255,255,255,0.3)',
                        '&:hover': { color: member.color },
                        transition: 'color 0.2s',
                        display: 'flex',
                      }}
                    >
                      <LinkedInIcon fontSize="small" />
                    </Box>
                    <Box
                      component="a"
                      href={member.twitter}
                      sx={{
                        color: 'rgba(255,255,255,0.3)',
                        '&:hover': { color: member.color },
                        transition: 'color 0.2s',
                        display: 'flex',
                      }}
                    >
                      <TwitterIcon fontSize="small" />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Container maxWidth="md" sx={{ py: 12 }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{
            p: { xs: 4, md: 7 },
            borderRadius: '24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.08))',
            border: '1px solid rgba(108,99,255,0.2)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' } }}
          >
            Ready to design your dream home?
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, mb: 4 }}
          >
            Join 12,000+ homebuilders already using HouseOS — free to start, powerful to grow.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/register')}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
                '&:hover': { background: 'linear-gradient(135deg, #5750D9, #7A73EE)' },
              }}
            >
              Start for Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1.05rem',
                borderColor: 'rgba(108,99,255,0.4)',
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { borderColor: '#6C63FF', background: 'rgba(108,99,255,0.08)' },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>

      {/* ── FOOTER ── */}
      <Box
        component="footer"
        sx={{
          borderTop: '1px solid rgba(108,99,255,0.12)',
          background: 'rgba(8,10,14,0.9)',
          pt: 10,
          pb: 6,
        }}
      >
        <Container maxWidth="lg">
          {/* Brand row */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '11px',
                    background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HomeWorkIcon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  HouseOS
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, mb: 3, maxWidth: 240 }}
              >
                AI-powered architecture tools for homeowners, builders, and architects worldwide.
              </Typography>

              {/* Social icons */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                {[
                  { icon: <TwitterIcon fontSize="small" />, href: '#' },
                  { icon: <LinkedInIcon fontSize="small" />, href: '#' },
                  { icon: <GitHubIcon fontSize="small" />, href: 'https://github.com/KKABIR07/HomeOS' },
                  { icon: <InstagramIcon fontSize="small" />, href: '#' },
                  { icon: <YouTubeIcon fontSize="small" />, href: '#' },
                ].map((s, i) => (
                  <Box
                    key={i}
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      background: 'rgba(108,99,255,0.08)',
                      border: '1px solid rgba(108,99,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.4)',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: 'rgba(108,99,255,0.2)',
                        color: '#8B85FF',
                        borderColor: 'rgba(108,99,255,0.4)',
                      },
                    }}
                  >
                    {s.icon}
                  </Box>
                ))}
              </Box>

              {/* Email */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}
                >
                  hello@houseos.ai
                </Typography>
              </Box>
            </Grid>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <Grid item xs={6} sm={4} md key={category}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    fontSize: '0.7rem',
                    display: 'block',
                    mb: 2,
                  }}
                >
                  {category}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {links.map((link) => (
                    <Typography
                      key={link.label}
                      variant="body2"
                      onClick={() => navigate(link.path)}
                      sx={{
                        color: 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'color 0.2s',
                        '&:hover': { color: '#8B85FF' },
                      }}
                    >
                      {link.label}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ borderColor: 'rgba(108,99,255,0.08)', mb: 4 }} />

          {/* Bottom row — nav links + copyright */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { md: 'center' },
              gap: 3,
            }}
          >
            {/* Nav links in footer (no top bar) */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {[
                { label: 'Home', path: '/' },
                { label: 'About', path: '/about' },
                { label: 'Features', path: '/#features' },
                { label: 'Pricing', path: '/#pricing' },
                { label: 'Marketplace', path: '/register' },
                { label: 'Community', path: '/register' },
                { label: 'Blog', path: '#' },
                { label: 'Careers', path: '#' },
                { label: 'Contact', path: '#' },
              ].map((link) => (
                <Typography
                  key={link.label}
                  variant="body2"
                  onClick={() => navigate(link.path)}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    borderRadius: '6px',
                    transition: 'all 0.2s',
                    '&:hover': { color: '#8B85FF', background: 'rgba(108,99,255,0.08)' },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Box>

            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              © 2026 HouseOS · All rights reserved · Built with ♥ by KKABIR07
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
