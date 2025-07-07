import React, { useEffect, useState } from 'react';
import './App.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';

import Slider from 'react-slick';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_URL = 'http://127.0.0.1:5000/api/products';

    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("API'den alınan veri:", data);
        const productsWithColor = data.map(product => ({
          ...product,
          selectedColor: 'yellow'
        }));
        setProducts(productsWithColor);
      })
      .catch(error => {
        console.error("Ürünler çekilirken hata oluştu:", error);
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleColorChange = (productId, color) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.name === productId ? { ...product, selectedColor: color } : product
      )
    );
  };

  const renderStars = (popularityScore) => {
    const stars = [];
    const fullStars = Math.floor(popularityScore);
    const hasHalfStar = popularityScore % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} />);
    }

    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} />);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={farStar} />);
    }
    return stars;
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  if (loading) {
    return <div className="App">Loading products...</div>;
  }

  if (error) {
    return <div className="App">Hata: {error.message}. Failed to load products. Please make sure the backend is running.</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Product List</h1>
      </header>
      <div className="carousel-container">
        <Slider {...settings}>
          {products.map(product => (
            <div key={product.name} className="product-item-wrapper">
              <div className="product-item">
                <h2>{product.name}</h2>
                <p>${product.price ? product.price.toFixed(2) : 'N/A'} USD</p>
                <p>
                  <span className="popularity-stars">
                    {renderStars(product.popularity_5_scale)}
                  </span>
                  {product.popularity_5_scale}/5
                </p>
                {product.images && product.images[product.selectedColor] && (
                  <img
                    src={product.images[product.selectedColor]}
                    alt={product.name}
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                )}
                <div className="color-picker">
                  {product.images.yellow && (
                    <button
                      className={`color-swatch yellow ${product.selectedColor === 'yellow' ? 'selected' : ''}`}
                      onClick={() => handleColorChange(product.name, 'yellow')}
                      title="Yellow Gold"
                    ></button>
                  )}
                  {product.images.white && (
                    <button
                      className={`color-swatch white ${product.selectedColor === 'white' ? 'selected' : ''}`}
                      onClick={() => handleColorChange(product.name, 'white')}
                      title="White Gold"
                    ></button>
                  )}
                  {product.images.rose && (
                    <button
                      className={`color-swatch rose ${product.selectedColor === 'rose' ? 'selected' : ''}`}
                      onClick={() => handleColorChange(product.name, 'rose')}
                      title="Rose Gold"
                    ></button>
                  )}
                </div>
                <p className="selected-color-name">
                  {product.selectedColor === 'yellow' && 'Yellow Gold'}
                  {product.selectedColor === 'white' && 'White Gold'}
                  {product.selectedColor === 'rose' && 'Rose Gold'}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

export default App;
