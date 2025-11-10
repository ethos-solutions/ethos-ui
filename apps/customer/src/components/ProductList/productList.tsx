import React, { useEffect, useRef, useState } from 'react';
import styles from './productList.module.scss';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_CATEGORY, GET_PRODUCT_LIST } from '../../api/Queries/Product';
import { TabContext } from '@mui/lab';
import { Chip, Iconbutton } from '@ethos-frontend/ui';
import { SearchBar } from './searchBar';
import { CHARACTERSTICS_DETAILS } from '../../api/Queries/Characterstics';
import { Characteristics } from './productList.model';
import { CategoryTabs } from './categoryTabs';
import { CountFloater } from './countFloater';
import { Filters } from './filters';
import { CategoryDetailsWrapper } from './categoryDetailTabs';
import { debounce, setStorage } from '@ethos-frontend/utils';

export function ProductList() {
  const ref = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement | null>(null);
  const [categories, setCategories] = useState<
    {
      name: string;
      _id: string;
      category_type: string;
    }[]
  >();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryType, setSelectedCategoryType] = useState<string>('');
  const [viewportHeight, setViewportHeight] = useState(0);
  const [showFloater, setShowFloater] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [characteristics, setCharacteristics] = useState<Characteristics[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Characteristics[]>([]);
  const [selectedFilterValues, setSelectedFilterValues] = useState<
    Characteristics[]
  >([]);
  const [quantity, setQuantity] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useQuery(GET_CATEGORY, {
    onCompleted: (res) => {
      const sortedCategories = res?.categories?.data
        ?.slice()
        .sort(
          (a: { order: number }, b: { order: number }) => a?.order - b?.order
        );

      if (sortedCategories.length > 0) {
        setCategories(sortedCategories);
        const initialCategory = sortedCategories[0];
        setSelectedCategory(initialCategory._id);
        setSelectedCategoryType(initialCategory.category_type);

        fetchProductList({
          variables: {
            params: {
              searchKey: '',
              categoryId: initialCategory._id,
              category_type: initialCategory.category_type,
              ...(selectedFilterValues.length > 0
                ? {
                    characteristicIds: selectedFilterValues.map(
                      (char) => char.value
                    ),
                  }
                : {}),
            },
          },
        });
      }
    },
  });

  useQuery(CHARACTERSTICS_DETAILS, {
    onCompleted: (res) => {
      const data = res.customerAccount.characteristics.map(
        (item: { name: string; _id: string }, index: number) => ({
          key: index,
          label: item.name,
          value: item._id,
        })
      );
      setCharacteristics(data);
    },
  });

  const [fetchProductList, { data: productListData }] =
    useLazyQuery(GET_PRODUCT_LIST);

  const debouncedFetchProductList = debounce(
    (
      searchQuery: string,
      selectedFilterValues: Characteristics[],
      category: string,
      categoryType: string
    ) => {
      fetchProductList({
        variables: {
          params: {
            searchKey: searchQuery,
            categoryId: category,
            category_type: categoryType,
            ...(selectedFilterValues.length > 0
              ? {
                  characteristicIds: selectedFilterValues.map(
                    (char) => char.value
                  ),
                }
              : {}),
          },
        },
      });
    },
    500
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateHeight = () => {
      const offsetTop = ref.current?.offsetTop || 0;
      const counterHeight = counterRef.current
        ? counterRef.current?.clientHeight
        : 0;
      const availableHeight = window.innerHeight - offsetTop - counterHeight;
      setViewportHeight(availableHeight);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, [categories, viewportHeight, ref, productListData, cartCount]);

  useEffect(() => {
    if (quantity) setStorage('totalQty', quantity as unknown as string);
  }, [quantity]);

  useEffect(() => {
    if (categories && selectedCategory) {
      const selectedCat = categories?.find(
        (cat: { _id: string }) => cat._id === selectedCategory
      );
      if (selectedCat) {
        debouncedFetchProductList(
          searchQuery,
          selectedFilterValues,
          selectedCat._id,
          selectedCat.category_type
        );
      }
    }
  }, [categories, selectedFilterValues, searchQuery, selectedCategory]);

  const handleTabChange = (value: string) => {
    const selectedCat = categories?.find(
      (val: { _id: string }) => value === val._id
    );

    if (selectedCat) {
      setSelectedCategory(selectedCat._id);
      setSelectedCategoryType(selectedCat.category_type);
      debouncedFetchProductList(
        searchQuery,
        selectedFilterValues,
        selectedCat._id,
        selectedCat.category_type
      );
    }
  };

  const handleDelete = (chipToDelete: { key?: number }) => () => {
    setSelectedFilterValues((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
    setSelectedValues((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };

  const handleSearchSubmit = (data: string) => {
    setSearchQuery(data);

    if (categories && selectedCategory) {
      const selectedCat = categories?.find(
        (cat) => cat._id === selectedCategory
      );
      if (selectedCat) {
        debouncedFetchProductList(
          data,
          selectedFilterValues,
          selectedCat._id,
          selectedCat.category_type
        );
      }
    }
  };

  const applyFilters = () => {
    setFilterOpen(false);
    setSelectedFilterValues(selectedValues);
  };

  return (
    <>
      <div className={styles.footItems}>
        <div className={styles.header}>
          <div className={styles.headerMenu}>
            <SearchBar onSearchSubmit={handleSearchSubmit} />
            <Iconbutton
              name="filter"
              onClick={() => setFilterOpen(true)}
              iconColor="#3F3F3F"
            />
          </div>
          <div className={styles.headerTags}>
            {selectedFilterValues.map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                onDelete={handleDelete(chip)}
              />
            ))}
          </div>
        </div>
        <div className={styles.foodItemHolder}>
          <TabContext value={selectedCategory}>
            <CategoryTabs
              categories={categories}
              handleTabChange={handleTabChange}
            />
            {productListData ? (
              <div
                ref={ref}
                className={styles.productList}
                style={{ maxHeight: `${viewportHeight}px` }}
              >
                <CategoryDetailsWrapper
                  productList={productListData?.customerProducts?.data}
                  selectedCategory={selectedCategory}
                  setShowFloater={setShowFloater}
                  setCartCount={setCartCount}
                  setQuantity={setQuantity}
                  selectedCategoryType={selectedCategoryType}
                />
              </div>
            ) : null}
          </TabContext>
        </div>
      </div>
      <CountFloater
        counterRef={counterRef}
        cartCount={cartCount}
        quantity={quantity}
        showFloater={showFloater}
      />
      <Filters
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        characteristics={characteristics}
        selectedValues={selectedValues}
        setSelectedValues={setSelectedValues}
        applyFilters={applyFilters}
      />
    </>
  );
}
