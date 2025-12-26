import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// ES modules için __dirname alternatifi
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// package.json'dan versiyonu oku
const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const appVersion = packageJson.version

// CSS cache busting plugin - sadece production build'lerde çalışır
const cssCacheBustingPlugin = () => {
  return {
    name: 'css-cache-busting',
    apply: 'build', // Sadece build modunda çalışır
    transformIndexHtml(html) {
      // package.json'daki uygulama versiyonunu kullan
      const version = appVersion
      
      // CSS link'lerini bul ve versiyon parametresi ekle
      // Vite production build'de CSS dosyalarını <link rel="stylesheet"> olarak ekler
      return html.replace(
        /(<link[^>]*rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["'])([^"']+\.css)(["'][^>]*\/?>)/gi,
        (match, before, cssPath, after) => {
          // Eğer zaten query parametresi varsa, versiyonu güncelle
          // Yoksa yeni versiyon parametresi ekle
          const separator = cssPath.includes('?') ? '&' : '?'
          return `${before}${cssPath}${separator}v=${version}${after}`
        }
      )
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    cssCacheBustingPlugin()
  ],
})
