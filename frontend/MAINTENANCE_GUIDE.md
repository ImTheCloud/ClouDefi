# 🛠️ Guide de Maintenance du Nouveau Design

## 📋 Comment Travailler avec le Nouveau Système de Design

### 1️⃣ Ajouter une Nouvelle Couleur

**Étape 1**: Définir dans `src/index.css` `:root`
```css
:root {
  /* Nouvelles couleurs */
  --color-custom: #your-hex;
  --color-custom-light: #lighter-shade;
  --color-custom-dark: #darker-shade;
}
```

**Étape 2**: Utiliser dans vos CSS
```css
.element {
  color: var(--color-custom);
  background: var(--color-custom-light);
}

.element:hover {
  background: var(--color-custom-dark);
}
```

### 2️⃣ Modifier un Spacing

Tous les espacements viennent du système:
```css
/* ❌ Mauvais */
.box {
  padding: 15px;
  margin: 10px;
}

/* ✅ Bon */
.box {
  padding: var(--spacing-lg);    /* 16px */
  margin: var(--spacing-md);     /* 12px */
}
```

**Spacings disponibles:**
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px  
- `--spacing-md`: 12px
- `--spacing-lg`: 16px
- `--spacing-xl`: 24px
- `--spacing-2xl`: 32px
- `--spacing-3xl`: 48px

### 3️⃣ Créer un Nouveau Composant

```tsx
// src/components/MyComponent.tsx
import './MyComponent.css'

export const MyComponent = () => {
  return <div className="my-component">Content</div>
}
```

```css
/* src/components/MyComponent.css */
.my-component {
  padding: var(--spacing-lg);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

.my-component:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-text-secondary);
}
```

```css
/* src/main.css - Ajouter au fichier */
@import './components/MyComponent.css';
```

### 4️⃣ Ajouter un Variant de Button

```css
/* src/index.css - Dans la section buttons */
.btn-custom {
  background: var(--color-custom);
  border-color: var(--color-custom);
  color: white;
}

.btn-custom:hover:not(:disabled) {
  background: var(--color-custom-dark);
  border-color: var(--color-custom-dark);
}
```

```tsx
// Utilisation
<Button variant="custom">Click me</Button>
```

### 5️⃣ Responsive Mobile

**Toujours penser mobile-first:**

```css
.element {
  /* Style par défaut (mobile) */
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Puis augmenter la complexité pour desktop */
@media (min-width: 768px) {
  .element {
    grid-template-columns: repeat(3, 1fr);
    width: 80%;
  }
}
```

### 6️⃣ Animation et Transitions

**Utiliser les variables de transition:**

```css
/* ❌ Mauvais */
.element {
  transition: all 0.3s ease;
}

/* ✅ Bon */
.element {
  transition: all var(--transition-base); /* 200ms */
}
```

**Pour animations rapides:**
```css
.btn {
  transition: all var(--transition-fast); /* 150ms */
}
```

**Pour animations lentes:**
```css
.modal {
  transition: all var(--transition-slow); /* 300ms */
}
```

---

## 🎨 Conseils de Design

### ✅ À Faire

1. **Utiliser les variables CSS** pour toutes les valeurs
2. **Spacer régulièrement** avec le système (4px, 8px, 12px, etc.)
3. **Vérifier le contraste** (au moins 4.5:1 pour le texte)
4. **Tester sur mobile** à 375px de largeur
5. **Grouper les styles** par fichier logique
6. **Nommer les classes** de manière explicite
7. **Commenter les sections** importantes

### ❌ À Éviter

1. ❌ Utiliser des couleurs en dur (`#ff0000` au lieu de `var(--color-error)`)
2. ❌ Espacements aléatoires (`margin: 13px` au lieu de `--spacing-md`)
3. ❌ Transitions différentes (`transition: 0.5s` au lieu d'une variable)
4. ❌ Styles inline dans les éléments React
5. ❌ `!important` (indique un problème de cascade)
6. ❌ Noms de classes génériques (`box`, `container`, `item`)
7. ❌ Tailles de police en dur (utiliser `--font-size-*`)

---

## 🔍 Checklist Avant Commit

```markdown
- [ ] Toutes les couleurs utilisent des variables
- [ ] Tous les espacements utilisent le système
- [ ] Pas de transitions custom (utiliser les variables)
- [ ] Le composant fonctionne sur mobile (768px)
- [ ] Focus states visibles pour les inputs
- [ ] Pas de scrollbars horizontales
- [ ] Texte lisible (contraste OK)
- [ ] Pas d'erreurs console
- [ ] CSS bien organisé (une classe par responsabilité)
- [ ] Fichier CSS créé si composant nouveau
- [ ] Import ajouté au main.css si nouveau fichier
```

---

## 🐛 Déboguer les Problèmes Courants

### Le couleur ne change pas
**Solution**: Vérifiez que vous utilisez une variable valide
```css
/* Vérifiez que la variable existe dans :root */
color: var(--color-text-primary); ✅
color: var(--color-random);       ❌
```

### L'espacement est incohérent
**Solution**: Utilisez toujours le système
```css
/* Toujours en multiple de 4 */
padding: var(--spacing-lg);    ✅ (16px)
margin: var(--spacing-md);     ✅ (12px)
gap: 13px;                     ❌ (pas dans le système)
```

### La transition est trop rapide/lente
**Solution**: Changez la variable utilisée
```css
transition: all var(--transition-fast);  /* 150ms */
transition: all var(--transition-base);  /* 200ms */
transition: all var(--transition-slow);  /* 300ms */
```

### Le focus state n'apparaît pas
**Solution**: Vérifiez que l'input a le focus visible
```css
.input:focus {
  outline: none;                           /* Supprimer le défaut */
  border-color: var(--color-accent);       /* Bordure colorée */
  box-shadow: 0 0 0 3px var(--color-accent-light);  /* Ring */
}
```

### Problème de responsive
**Solution**: Inspectez à la bonne largeur
```
- Mobile: 375px (max-width: 768px)
- Desktop: 1200px (min-width: 768px)
```

---

## 📈 Évolution Future

### Thème Sombre (Dark Mode)
Facile à ajouter avec `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1a1a1a;
    --color-text-primary: #ffffff;
    /* ... */
  }
}
```

### Nouveau Breakpoint
```css
@media (max-width: 480px) {
  /* Smartphones petits */
}

@media (min-width: 1024px) {
  /* Grands écrans */
}
```

### Ajouter des Fonts
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap');

.serif {
  font-family: 'Noto Serif', serif;
}
```

---

## 📚 Ressources Utiles

- [CSS Variables (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Responsive Testing Tool](https://responsivedesignchecker.com/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 💡 Bonnes Pratiques

### 1. Nommer les Classes
```css
/* ✅ Bon - Clair et descriptif */
.sidebar-nav-item { }
.card-header { }
.button-primary { }

/* ❌ Mauvais - Trop générique */
.item { }
.header { }
.btn { }
```

### 2. Ordre des Propriétés
```css
.element {
  /* 1. Position/Layout */
  position: relative;
  display: flex;
  
  /* 2. Dimensions */
  width: 100%;
  padding: var(--spacing-lg);
  
  /* 3. Style */
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  
  /* 4. Texte */
  color: var(--color-text-primary);
  font-weight: 600;
  
  /* 5. Animations */
  transition: all var(--transition-base);
}
```

### 3. Séparer Logique et Style
```tsx
// ❌ Mauvais - Style mélangé avec logique
<div style={{ color: '#2563eb', padding: '16px' }}>
  Content
</div>

// ✅ Bon - Séparer dans CSS
<div className="my-component">
  Content
</div>
```

### 4. Documenter les Sections
```css
/* ===== Sidebar ===== */
.sidebar { }
.sidebar-nav { }

/* ===== Forms ===== */
.input { }
.field { }
```

---

## ✨ Conclusion

Ce système de design est conçu pour être:
- **Simple** à utiliser
- **Consistant** dans toute l'app
- **Scalable** pour la croissance
- **Maintenable** pour l'équipe

Respectez ces guidelines et le code restera propre et professionnel! 🎉
