import requests
import sys
import json
from datetime import datetime

class TrafficGeneratorAPITester:
    def __init__(self, base_url="https://organic-pulse.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            
            result = {
                'test_name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'success': success,
                'response_data': None,
                'error': None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result['response_data'] = response.json()
                except:
                    result['response_data'] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    result['error'] = error_data
                    print(f"   Error: {error_data}")
                except:
                    result['error'] = response.text
                    print(f"   Error: {response.text}")

            self.test_results.append(result)
            return success, result['response_data'] if success else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                'test_name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': None,
                'success': False,
                'response_data': None,
                'error': str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_analytics_empty(self):
        """Test analytics with empty database"""
        return self.run_test("Analytics (Empty)", "GET", "analytics", 200)

    def test_get_content_empty(self):
        """Test get all content with empty database"""
        return self.run_test("Get All Content (Empty)", "GET", "content", 200)

    def test_create_content_url(self):
        """Test creating content from URL"""
        test_data = {
            "input_type": "url",
            "url": "https://example.com"
        }
        success, response = self.run_test(
            "Create Content (URL)", 
            "POST", 
            "content", 
            200, 
            data=test_data,
            timeout=60  # Longer timeout for LLM processing
        )
        return success, response

    def test_create_content_manual(self):
        """Test creating content manually"""
        test_data = {
            "input_type": "manual",
            "title": "Test Article for Traffic Generation",
            "content": "This is a comprehensive test article about organic traffic generation using AI and LLM optimization. It covers various strategies for improving search visibility and generating synthetic queries that help LLMs understand and reference your content effectively."
        }
        success, response = self.run_test(
            "Create Content (Manual)", 
            "POST", 
            "content", 
            200, 
            data=test_data,
            timeout=60  # Longer timeout for LLM processing
        )
        return success, response

    def test_get_content_by_id(self, content_id):
        """Test getting content by ID"""
        return self.run_test(
            "Get Content by ID", 
            "GET", 
            f"content/{content_id}", 
            200
        )

    def test_get_queries_for_content(self, content_id):
        """Test getting synthetic queries for content"""
        return self.run_test(
            "Get Content Queries", 
            "GET", 
            f"queries/{content_id}", 
            200
        )

    def test_delete_content(self, content_id):
        """Test deleting content"""
        return self.run_test(
            "Delete Content", 
            "DELETE", 
            f"content/{content_id}", 
            200
        )

    def test_analytics_with_data(self):
        """Test analytics after adding content"""
        return self.run_test("Analytics (With Data)", "GET", "analytics", 200)

def main():
    print("🚀 Starting Organic Traffic Generator API Tests")
    print("=" * 60)
    
    tester = TrafficGeneratorAPITester()
    
    # Test 1: Root endpoint
    tester.test_root_endpoint()
    
    # Test 2: Analytics (empty state)
    tester.test_analytics_empty()
    
    # Test 3: Get content (empty state)
    tester.test_get_content_empty()
    
    # Test 4: Create content from URL
    print("\n📝 Testing URL-based content creation...")
    url_success, url_content = tester.test_create_content_url()
    url_content_id = url_content.get('id') if url_success else None
    
    # Test 5: Create content manually
    print("\n📝 Testing manual content creation...")
    manual_success, manual_content = tester.test_create_content_manual()
    manual_content_id = manual_content.get('id') if manual_success else None
    
    # Test 6: Get content by ID (if creation succeeded)
    if url_content_id:
        tester.test_get_content_by_id(url_content_id)
        tester.test_get_queries_for_content(url_content_id)
    
    if manual_content_id:
        tester.test_get_content_by_id(manual_content_id)
        tester.test_get_queries_for_content(manual_content_id)
    
    # Test 7: Analytics with data
    tester.test_analytics_with_data()
    
    # Test 8: Delete content (if creation succeeded)
    if url_content_id:
        tester.test_delete_content(url_content_id)
    
    if manual_content_id:
        tester.test_delete_content(manual_content_id)
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    # Print detailed results
    print("\n📋 Detailed Results:")
    for result in tester.test_results:
        status = "✅ PASS" if result['success'] else "❌ FAIL"
        print(f"   {status} - {result['test_name']} ({result['method']} {result['endpoint']})")
        if not result['success'] and result['error']:
            print(f"      Error: {result['error']}")
    
    # Check for critical issues
    critical_failures = [r for r in tester.test_results if not r['success'] and r['test_name'] in ['Root API', 'Create Content (Manual)', 'Analytics (Empty)']]
    
    if len(critical_failures) > 0:
        print(f"\n🚨 Critical failures detected: {len(critical_failures)}")
        return 1
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 70 else 1

if __name__ == "__main__":
    sys.exit(main())