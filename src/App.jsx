import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Trophy, RotateCcw, Zap, Target, Crown, Gamepad2 } from 'lucide-react'
import { useLocalStorage, useWindowSize } from 'react-use'
import Confetti from 'react-confetti'
import toast, { Toaster } from 'react-hot-toast'
import './App.css'

const CHOICES = [
  { id: 1, name: 'Rock', emoji: '🗿', color: 'from-slate-600 to-slate-800', hoverColor: 'hover:from-slate-500 hover:to-slate-700', beats: [3, 4] },
  { id: 2, name: 'Paper', emoji: '📄', color: 'from-slate-500 to-slate-700', hoverColor: 'hover:from-slate-400 hover:to-slate-600', beats: [1, 5] },
  { id: 3, name: 'Scissors', emoji: '✂️', color: 'from-slate-700 to-slate-900', hoverColor: 'hover:from-slate-600 hover:to-slate-800', beats: [2, 4] },
  { id: 4, name: 'Lizard', emoji: '🦎', color: 'from-slate-600 to-slate-800', hoverColor: 'hover:from-slate-500 hover:to-slate-700', beats: [2, 5] },
  { id: 5, name: 'Spock', emoji: '🖖', color: 'from-slate-500 to-slate-700', hoverColor: 'hover:from-slate-400 hover:to-slate-600', beats: [1, 3] }
]

const WIN_MESSAGES = {
  1: { 3: 'Rock crushes Scissors', 4: 'Rock crushes Lizard' },
  2: { 1: 'Paper covers Rock', 5: 'Paper disproves Spock' },
  3: { 2: 'Scissors cuts Paper', 4: 'Scissors decapitates Lizard' },
  4: { 2: 'Lizard eats Paper', 5: 'Lizard poisons Spock' },
  5: { 1: 'Spock vaporizes Rock', 3: 'Spock smashes Scissors' }
}

function App() {
  const [gameState, setGameState] = useState('waiting') // waiting, playing, revealing, finished
  const [userChoice, setUserChoice] = useState(null)
  const [computerChoice, setComputerChoice] = useState(null)
  const [result, setResult] = useState(null) // win, lose, tie
  const [countdown, setCountdown] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [stats, setStats] = useLocalStorage('rpsls-stats', { wins: 0, losses: 0, ties: 0, streak: 0, bestStreak: 0 })
  const { width, height } = useWindowSize()

  const getRandomChoice = () => CHOICES[Math.floor(Math.random() * CHOICES.length)]

  const determineWinner = (user, computer) => {
    if (user.id === computer.id) return 'tie'
    return user.beats.includes(computer.id) ? 'win' : 'lose'
  }

  const getWinMessage = (user, computer) => {
    if (user.beats.includes(computer.id)) {
      return WIN_MESSAGES[user.id][computer.id]
    } else {
      return WIN_MESSAGES[computer.id][user.id]
    }
  }

  const handleChoice = (choice) => {
    if (gameState !== 'waiting') return
    
    setUserChoice(choice)
    setGameState('playing')
    setCountdown(3)
    
    toast.success(`You chose ${choice.name}! ${choice.emoji}`, {
      duration: 2000,
      style: { background: '#1f2937', color: '#fff' }
    })
  }

  const resetGame = () => {
    setGameState('waiting')
    setUserChoice(null)
    setComputerChoice(null)
    setResult(null)
    setCountdown(0)
    setShowConfetti(false)
  }

  useEffect(() => {
    if (gameState === 'playing' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameState === 'playing' && countdown === 0) {
      const computer = getRandomChoice()
      setComputerChoice(computer)
      setGameState('revealing')
      
      setTimeout(() => {
        const gameResult = determineWinner(userChoice, computer)
        setResult(gameResult)
        setGameState('finished')
        
        // Update stats
        const newStats = { ...stats }
        if (gameResult === 'win') {
          newStats.wins++
          newStats.streak++
          newStats.bestStreak = Math.max(newStats.bestStreak, newStats.streak)
          setShowConfetti(true)
          toast.success('🎉 You Win!', { duration: 3000, style: { background: '#059669', color: '#fff' } })
          setTimeout(() => setShowConfetti(false), 5000)
        } else if (gameResult === 'lose') {
          newStats.losses++
          newStats.streak = 0
          toast.error('💀 You Lose!', { duration: 3000, style: { background: '#dc2626', color: '#fff' } })
        } else {
          newStats.ties++
          toast('🤝 It\'s a Tie!', { duration: 3000, style: { background: '#f59e0b', color: '#fff' } })
        }
        setStats(newStats)
      }, 1500)
    }
  }, [gameState, countdown, userChoice, stats])

  const totalGames = stats.wins + stats.losses + stats.ties
  const winRate = totalGames > 0 ? ((stats.wins / totalGames) * 100).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      <Toaster position="top-center" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 bg-clip-text text-transparent mb-4">
            Rock Paper Scissors Lizard Spock
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            The ultimate game of strategy and chance. Each choice beats exactly two others and loses to two others.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border-emerald-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              <div className="text-2xl font-bold text-white">{stats.wins}</div>
              <div className="text-emerald-300 text-sm">Wins</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-rose-600/20 to-rose-800/20 border-rose-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-rose-400" />
              <div className="text-2xl font-bold text-white">{stats.losses}</div>
              <div className="text-rose-300 text-sm">Losses</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border-amber-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <div className="text-2xl font-bold text-white">{stats.ties}</div>
              <div className="text-amber-300 text-sm">Ties</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">{winRate}%</div>
              <div className="text-blue-300 text-sm">Win Rate</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-violet-600/20 to-violet-800/20 border-violet-500/30 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Crown className="w-6 h-6 mx-auto mb-2 text-violet-400" />
              <div className="text-2xl font-bold text-white">{stats.bestStreak}</div>
              <div className="text-violet-300 text-sm">Best Streak</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Game Area */}
        <div className="max-w-4xl mx-auto">
          {/* Choice Selection */}
          {gameState === 'waiting' && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-center mb-6">Choose Your Weapon</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {CHOICES.map((choice) => (
                  <motion.div
                    key={choice.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => handleChoice(choice)}
                      className={`h-32 w-full bg-gradient-to-br ${choice.color} ${choice.hoverColor} border-2 border-slate-400/20 hover:border-slate-300/40 transition-all duration-300 shadow-lg hover:shadow-xl`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{choice.emoji}</div>
                        <div className="font-semibold">{choice.name}</div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 text-center text-gray-400">
                <p className="mb-2">Game Rules:</p>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                  <div>Rock crushes Scissors & Lizard</div>
                  <div>Paper covers Rock & disproves Spock</div>
                  <div>Scissors cuts Paper & decapitates Lizard</div>
                  <div>Lizard eats Paper & poisons Spock</div>
                  <div>Spock vaporizes Rock & smashes Scissors</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Countdown */}
          {gameState === 'playing' && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-8"
            >
              <div className="text-8xl font-bold mb-4 text-yellow-400">
                {countdown}
              </div>
              <div className="text-xl text-gray-300">Get ready...</div>
            </motion.div>
          )}

          {/* Battle Arena */}
          {(gameState === 'revealing' || gameState === 'finished') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* User Choice */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-center"
                >
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">You</h3>
                  <Card className={`bg-gradient-to-br ${userChoice?.color} border-2 border-slate-400/30 shadow-lg`}>
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">{userChoice?.emoji}</div>
                      <div className="text-xl font-bold text-white">{userChoice?.name}</div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* VS Divider */}
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-4xl font-bold text-yellow-400 mb-4"
                  >
                    ⚡
                  </motion.div>
                  <div className="text-2xl font-bold text-gray-300">VS</div>
                </div>

                {/* Computer Choice */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-center"
                >
                  <h3 className="text-xl font-semibold mb-4 text-red-400">Computer</h3>
                  <Card className={`bg-gradient-to-br ${computerChoice?.color} border-2 border-slate-400/30 shadow-lg`}>
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">{computerChoice?.emoji}</div>
                      <div className="text-xl font-bold text-white">{computerChoice?.name}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Result */}
              {gameState === 'finished' && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center mt-8"
                >
                  <Card className={`mx-auto max-w-md ${
                    result === 'win' ? 'bg-gradient-to-br from-emerald-600/30 to-emerald-800/30 border-emerald-500/50 backdrop-blur-sm' :
                    result === 'lose' ? 'bg-gradient-to-br from-rose-600/30 to-rose-800/30 border-rose-500/50 backdrop-blur-sm' :
                    'bg-gradient-to-br from-amber-600/30 to-amber-800/30 border-amber-500/50 backdrop-blur-sm'
                  } shadow-xl`}>
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold mb-2">
                        {result === 'win' ? '🎉 You Win!' : 
                         result === 'lose' ? '💀 You Lose!' : 
                         '🤝 It\'s a Tie!'}
                      </div>
                      {result !== 'tie' && (
                        <div className="text-lg text-white/90">
                          {getWinMessage(userChoice, computerChoice)}
                        </div>
                      )}
                      {stats.streak > 1 && result === 'win' && (
                        <Badge className="mt-2 bg-yellow-500 text-black">
                          🔥 {stats.streak} Win Streak!
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Play Again Button */}
          {gameState === 'finished' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <Button
                onClick={resetGame}
                size="lg"
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-slate-400/30"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

