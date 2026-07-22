cat new_grid.jsx > temp.txt
sed -i -e '1231,1569c\' -e "$(cat new_grid.jsx | sed 's/$/\\/')" src/components/AddInvestmentModal.tsx
sed -i 's/\\$//' src/components/AddInvestmentModal.tsx
