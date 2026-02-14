#!/bin/bash

# Script d'optimisation des images pour le site Maison Lac du Bourget
# Convertit les PNG volumineux en JPEG optimisés et redimensionne les images trop grandes

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Répertoire des images
GALLERY_DIR="src/gallery"

# Taille maximale en pixels (largeur)
MAX_WIDTH=2560

# Qualité JPEG (0-100)
QUALITY=85

# Taille maximale de fichier en bytes (2 Mo)
MAX_SIZE=2097152

echo -e "${YELLOW}🖼️  Optimisation des images du site${NC}"
echo "================================================"

# Vérifier si ImageMagick est installé
if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ ImageMagick n'est pas installé.${NC}"
    echo "Installez-le avec: brew install imagemagick"
    exit 1
fi

# Compteurs
converted=0
skipped=0
errors=0

# Fonction pour obtenir la taille du fichier
get_file_size() {
    stat -f%z "$1" 2>/dev/null || stat -c%s "$1" 2>/dev/null
}

# Fonction pour formater la taille
format_size() {
    local size=$1
    if [ $size -ge 1048576 ]; then
        echo "$(echo "scale=1; $size/1048576" | bc) Mo"
    elif [ $size -ge 1024 ]; then
        echo "$(echo "scale=1; $size/1024" | bc) Ko"
    else
        echo "$size octets"
    fi
}

# Traiter les fichiers PNG volumineux
echo -e "\n${YELLOW}📁 Recherche des fichiers PNG volumineux...${NC}"

find "$GALLERY_DIR" -type f \( -name "*.png" -o -name "*.PNG" \) | while read -r file; do
    size=$(get_file_size "$file")
    
    if [ "$size" -gt "$MAX_SIZE" ]; then
        filename=$(basename "$file")
        dirname=$(dirname "$file")
        newfile="${dirname}/${filename%.*}.jpg"
        
        echo -e "\n${YELLOW}🔄 Conversion: $filename${NC}"
        echo "   Taille originale: $(format_size $size)"
        
        # Convertir PNG en JPEG avec redimensionnement si nécessaire
        if convert "$file" -resize "${MAX_WIDTH}x${MAX_WIDTH}>" -quality $QUALITY "$newfile" 2>/dev/null; then
            newsize=$(get_file_size "$newfile")
            savings=$((size - newsize))
            percent=$((savings * 100 / size))
            
            echo -e "   ${GREEN}✅ Converti en JPEG: $(format_size $newsize)${NC}"
            echo -e "   ${GREEN}💾 Économie: $(format_size $savings) (-${percent}%)${NC}"
            
            # Optionnel: supprimer l'original PNG
            # rm "$file"
            # echo "   🗑️  Original supprimé"
            
            ((converted++))
        else
            echo -e "   ${RED}❌ Erreur de conversion${NC}"
            ((errors++))
        fi
    fi
done

# Traiter les fichiers JPEG volumineux
echo -e "\n${YELLOW}📁 Optimisation des fichiers JPEG volumineux...${NC}"

find "$GALLERY_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.JPG" -o -name "*.JPEG" \) | while read -r file; do
    size=$(get_file_size "$file")
    
    if [ "$size" -gt "$MAX_SIZE" ]; then
        filename=$(basename "$file")
        
        echo -e "\n${YELLOW}🔄 Optimisation: $filename${NC}"
        echo "   Taille originale: $(format_size $size)"
        
        # Créer une copie temporaire
        tmpfile="${file}.tmp"
        
        if convert "$file" -resize "${MAX_WIDTH}x${MAX_WIDTH}>" -quality $QUALITY "$tmpfile" 2>/dev/null; then
            newsize=$(get_file_size "$tmpfile")
            
            if [ "$newsize" -lt "$size" ]; then
                mv "$tmpfile" "$file"
                savings=$((size - newsize))
                percent=$((savings * 100 / size))
                
                echo -e "   ${GREEN}✅ Optimisé: $(format_size $newsize)${NC}"
                echo -e "   ${GREEN}💾 Économie: $(format_size $savings) (-${percent}%)${NC}"
                ((converted++))
            else
                rm "$tmpfile"
                echo -e "   ${YELLOW}⏭️  Déjà optimisé${NC}"
                ((skipped++))
            fi
        else
            echo -e "   ${RED}❌ Erreur d'optimisation${NC}"
            rm -f "$tmpfile"
            ((errors++))
        fi
    fi
done

echo -e "\n================================================"
echo -e "${GREEN}✅ Optimisation terminée!${NC}"
echo ""
echo "Pour appliquer les changements, exécutez:"
echo "  chmod +x scripts/optimize-images.sh"
echo "  ./scripts/optimize-images.sh"
echo ""
echo "⚠️  Note: Ce script crée des copies JPEG des PNG."
echo "   Mettez à jour gallery.yaml pour pointer vers les nouveaux fichiers."
