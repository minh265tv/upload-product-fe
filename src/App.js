import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { ProgressBar, Alert, Container, Col, Row, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import config from './config.json'
import Pagination from "react-js-pagination";

function App() {
  const url = process.env.URL_SERVER || config.url;
  let uploadStatusAlert;
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [uploadStatus, setUploadStatus] = useState();
  const [products, setProducts] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPage, setTotalPage] = useState(10);
  const checkboxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    console.log(process.env);
    
    getListProduct(1, 10);
  }, [])

  const getListProduct = async (page, perPage) => {
    let response = await axios.get(url + '/products', {
      params: {
        page,
        perPage
      }
    });
    setTotalPage(response.data.total)
    setProducts(response.data.data);
  }

  const uploadFile = async ({ target: { files } }) => {
    let data = new FormData();
    data.append('file', files[0])
    data.append('replace', checkboxRef.current.checked)

    const options = {
      onUploadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        let percent = Math.floor((loaded * 100) / total)

        if (percent <= 100) {
          setUploadPercentage(percent)
        }
      }
    }
    try {
      let response = await axios.post(url + '/products/upload', data, options);
      inputRef.current.value = ""
      setUploadPercentage(0)
      getListProduct(1, 10)
      setActivePage(1)
      let variant = response.data.success ? 'success' : 'warning'
      uploadStatusAlert = <div style={{ marginTop: 30, height: '500px', overflowY: 'scroll' }}>
        {response.data.message.map((mess, id) => {
          return (
            <Alert key={id} variant={variant}>
              {mess}
            </Alert>
          )
        })}
      </div>
      setUploadStatus(uploadStatusAlert);
    } catch (error) {
      uploadStatusAlert = <div style={{ marginTop: 30 }}>
        <Alert variant={'warning'}>
          {`Failed to upload products due to error: ${error.message}`}
        </Alert>
      </div>
      setUploadStatus(uploadStatusAlert);
    }
  }

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
    getListProduct(pageNumber, 10)
  }

  return (
    <Container style={{ marginTop: 30 }}>
      <Row>
        <Col>
          <input type="file" className="form-control profile-pic-uploader" onChange={uploadFile} ref={inputRef} />
          <Form.Check type="checkbox" label="Replace duplicate" ref={checkboxRef} />
          {uploadPercentage > 0 && <ProgressBar style={{ marginTop: 10 }} now={uploadPercentage} label={`${uploadPercentage}%`} />}
          {uploadStatus && uploadStatus}
        </Col>
        <Col>
          <div style={{ height: '500px', overflowY: 'scroll' }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Image</th>
                  <th>Product Title</th>
                  <th>Variant Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td><img src={product.image} width={'100%'} /></td>
                      <td>{product.title}</td>
                      <td>{product.variantPrice}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
          <Pagination
            itemClass="page-item"
            linkClass="page-link"
            activePage={activePage}
            itemsCountPerPage={10}
            totalItemsCount={totalPage}
            pageRangeDisplayed={5}
            onChange={handlePageChange}
          />

        </Col>
      </Row>
    </Container>
  );
}

export default App;
