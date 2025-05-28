package it.polimi.tiw.progetti.filters;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

import it.polimi.tiw.progetti.beans.User;

/**
 * Servlet Filter implementation class StudenteChecker
 */
public class StudenteChecker extends HttpFilter implements Filter {
       
    /**
     * @see HttpFilter#HttpFilter()
     */
    public StudenteChecker() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see Filter#destroy()
	 */
	public void destroy() {
		// TODO Auto-generated method stub
	}

	/**
	 * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
	 */
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

		System.out.print("Studente filter executing \n");
		HttpServletRequest req = (HttpServletRequest) request;
		HttpServletResponse res = (HttpServletResponse) response;
		String loginpath = req.getServletContext().getContextPath() + "/CheckLogin";
		HttpSession s = req.getSession();
	    if (s == null) {
	        res.sendRedirect(loginpath);
	        return;
	    }
		User u = null;
        // check if the client is a worker
		u = (User) s.getAttribute("user");
		if(u==null) {
			System.out.print("StudenteUser è vuoto\n");
		
		}
		System.out.print("Il ruolo è \n" + u.getRole());
		if (!u.getRole().equals("studente")) {
			System.out.print("Sono nell'if");
			res.setStatus(HttpServletResponse.SC_FORBIDDEN);
			res.setHeader("Location",loginpath);
		    res.sendRedirect(loginpath);

			return;
		}

		// pass the request along the filter chain
		chain.doFilter(request, response);
	}

	/**
	 * @see Filter#init(FilterConfig)
	 */
	public void init(FilterConfig fConfig) throws ServletException {
		// TODO Auto-generated method stub
	}

}
